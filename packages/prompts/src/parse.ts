import type { ZodTypeAny, output } from 'zod';
import type { StateChange } from '@veillee/engine';
import { GmResponseEnvelopeSchema, RollRequestSchema, StateChangeSchema, type GmResponse } from './schema';

/** Isole l'objet JSON d'une réponse d'IA : retire les blocs de code et le texte autour. */
export function extractJson(raw: string): unknown {
  let text = raw.trim();
  const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fence) text = fence[1].trim();
  try {
    return JSON.parse(text);
  } catch {
    // on cherche le premier objet équilibré
  }
  const start = text.indexOf('{');
  if (start === -1) throw new Error('aucun objet JSON trouvé dans la réponse');
  const end = findMatchingBrace(text, start);
  const candidate = end === -1 ? text.slice(start) : text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch (e) {
    // dernier recours : virgules finales
    try {
      return JSON.parse(candidate.replace(/,\s*([}\]])/g, '$1'));
    } catch {
      throw new Error(`JSON invalide : ${(e as Error).message}`);
    }
  }
}

function findMatchingBrace(text: string, start: number): number {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export interface InvalidChange {
  raw: unknown;
  reason: string;
}

export type ParseResult =
  | { ok: true; value: GmResponse; invalidChanges: InvalidChange[]; invalidRoll: string | null }
  | { ok: false; error: string };

/**
 * Valide une réponse du MJ. L'enveloppe (narration) doit être valide ; chaque changement d'état
 * est validé séparément pour que seuls les changements malformés soient écartés.
 */
export function parseGmResponse(raw: string): ParseResult {
  let data: unknown;
  try {
    data = extractJson(raw);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const env = GmResponseEnvelopeSchema.safeParse(data);
  if (!env.success) return { ok: false, error: formatZodError(env.error) };

  const invalidChanges: InvalidChange[] = [];
  const state_changes: StateChange[] = [];
  for (const rawChange of env.data.state_changes) {
    const parsed = StateChangeSchema.safeParse(rawChange);
    if (parsed.success) state_changes.push(parsed.data as StateChange);
    else invalidChanges.push({ raw: rawChange, reason: formatZodError(parsed.error) });
  }

  let roll_request = null;
  let invalidRoll: string | null = null;
  if (env.data.roll_request) {
    const roll = RollRequestSchema.safeParse(env.data.roll_request);
    if (roll.success) roll_request = roll.data;
    else invalidRoll = formatZodError(roll.error);
  }

  return {
    ok: true,
    value: {
      narration: env.data.narration.trim(),
      roll_request,
      state_changes,
      memory_notes: env.data.memory_notes.filter((n) => n.trim()).slice(0, 10),
      suggested_actions: env.data.suggested_actions.filter((n) => n.trim()),
    },
    invalidChanges,
    invalidRoll,
  };
}

export function parseWith<S extends ZodTypeAny>(schema: S, raw: string): { ok: true; value: output<S> } | { ok: false; error: string } {
  let data: unknown;
  try {
    data = extractJson(raw);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const r = schema.safeParse(data);
  return r.success ? { ok: true, value: r.data } : { ok: false, error: formatZodError(r.error) };
}

export function formatZodError(error: { issues: Array<{ path: (string | number)[]; message: string }> }): string {
  return error.issues
    .slice(0, 5)
    .map((i) => `${i.path.join('.') || '(racine)'} : ${i.message}`)
    .join(' ; ');
}

/** Si le JSON est inutilisable, récupère au moins un texte lisible pour la narration. */
export function fallbackNarration(raw: string): string {
  const extractor = new NarrationExtractor();
  extractor.push(raw);
  const fromJson = extractor.text.trim();
  if (fromJson) return fromJson;
  const stripped = raw.replace(/```[a-z]*|```/gi, '').trim();
  if (stripped.startsWith('{')) return '';
  return stripped.slice(0, 2000);
}

/**
 * Extrait au fil de l'eau la valeur de la clé "narration" d'un JSON en cours de streaming,
 * pour afficher le texte pendant que l'IA écrit.
 */
export class NarrationExtractor {
  private buffer = '';
  private start = -1;
  private pos = 0;
  private done = false;
  private pendingEscape = '';
  text = '';

  /** Ajoute un morceau de flux ; renvoie le texte de narration nouvellement décodé. */
  push(chunk: string): string {
    this.buffer += chunk;
    if (this.done) return '';
    if (this.start === -1) {
      const m = /"narration"\s*:\s*"/.exec(this.buffer);
      if (!m) return '';
      this.start = m.index + m[0].length;
      this.pos = this.start;
    }
    let out = '';
    while (this.pos < this.buffer.length) {
      const ch = this.buffer[this.pos];
      if (this.pendingEscape) {
        const seq = this.pendingEscape + ch;
        if (seq.startsWith('\\u')) {
          if (seq.length < 6) {
            this.pendingEscape = seq;
            this.pos++;
            continue;
          }
          out += String.fromCharCode(parseInt(seq.slice(2), 16));
        } else {
          out += ({ n: '\n', t: '\t', r: '', b: '', f: '', '"': '"', '\\': '\\', '/': '/' } as Record<string, string>)[ch] ?? ch;
        }
        this.pendingEscape = '';
        this.pos++;
        continue;
      }
      if (ch === '\\') {
        this.pendingEscape = '\\';
        this.pos++;
        continue;
      }
      if (ch === '"') {
        this.done = true;
        break;
      }
      out += ch;
      this.pos++;
    }
    this.text += out;
    return out;
  }
}
