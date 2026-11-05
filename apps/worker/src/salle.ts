/**
 * Salle de jeu multijoueur : un Durable Object par partie, identifié par son code (6 caractères).
 *
 * Le navigateur de l'hôte reste l'arbitre (moteur + appels au MJ) ; la salle se contente de :
 *  - garder l'état de la partie, la pile d'annulation de l'hôte et la file d'actions déclarées ;
 *  - relayer en temps réel (WebSocket) les actions, l'état, la narration en direct et les dés ;
 *  - vérifier qui a le droit de faire quoi (seul l'hôte écrit l'état, chacun ne joue que ses personnages).
 *
 * Les WebSocket utilisent l'API « hibernation » : entre deux messages la salle est déchargée de la
 * mémoire et ne coûte rien (offre gratuite des Durable Objects SQLite).
 */

export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;
export const MAX_MEMBERS = 8;
export const MAX_PENDING = 40;
export const MAX_STATE_CHARS = 8_000_000;
const MAX_UNDO = 5;
const CHUNK = 500_000;
const IDLE_MS = 30 * 86_400_000; // une salle inactive 30 jours est effacée

export type ActionKind = 'action' | 'attack' | 'xcard' | 'character' | 'map_move';
const KINDS: ActionKind[] = ['action', 'attack', 'xcard', 'character', 'map_move'];

export interface Member {
  name: string;
  tokenHash: string;
  role: 'hote' | 'joueur';
}

export interface Meta {
  code: string;
  title: string;
  hostId: string;
  members: Record<string, Member>;
  nextActionId: number;
  createdAt: string;
  updatedAt: string;
  mapMovedAt?: Record<string, number>;
}

export interface PendingAction {
  id: number;
  playerId: string;
  kind: ActionKind;
  payload: Record<string, unknown>;
  at: string;
}

interface Attachment {
  playerId: string | null;
}

/** Sous-ensemble de l'API de stockage des Durable Objects utilisé ici (remplaçable dans les tests). */
export interface SalleStorage {
  get<T>(key: string): Promise<T | undefined>;
  put(entries: Record<string, unknown>): Promise<void>;
  delete(keys: string[]): Promise<number>;
  deleteAll(): Promise<void>;
  setAlarm(at: number): Promise<void>;
}

export interface SalleSocket {
  send(data: string): void;
  close(code?: number, reason?: string): void;
  serializeAttachment(v: unknown): void;
  deserializeAttachment(): unknown;
}

export interface SalleContext {
  storage: SalleStorage;
  getWebSockets(): SalleSocket[];
  acceptWebSocket(ws: SalleSocket): void;
  setWebSocketAutoResponse?(pair: unknown): void;
}

export function isValidCode(code: string): boolean {
  return code.length === CODE_LENGTH && [...code].every((c) => CODE_ALPHABET.includes(c));
}

export function normalizeCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, CODE_LENGTH);
}

export function randomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function cleanName(v: unknown): string {
  return typeof v === 'string' ? v.trim().slice(0, 40) || 'Joueur' : 'Joueur';
}

function validId(v: unknown): v is string {
  return typeof v === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(v);
}

function validToken(v: unknown): v is string {
  return typeof v === 'string' && v.length >= 16 && v.length <= 128;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
}

export class Salle {
  private messages: Promise<void> = Promise.resolve();
  private meta: Meta | null | undefined;
  private actions: PendingAction[] | undefined;

  constructor(
    private readonly ctx: SalleContext,
    _env?: unknown,
  ) {
    // « ping » → « pong » sans réveiller la salle : garde les connexions ouvertes à moindre coût.
    const Pair = (globalThis as { WebSocketRequestResponsePair?: new (a: string, b: string) => unknown }).WebSocketRequestResponsePair;
    if (Pair && ctx.setWebSocketAutoResponse) ctx.setWebSocketAutoResponse(new Pair('{"t":"ping"}', '{"t":"pong"}'));
  }

  // ---------- stockage ----------

  private async loadMeta(): Promise<Meta | null> {
    if (this.meta === undefined) this.meta = (await this.ctx.storage.get<Meta>('meta')) ?? null;
    return this.meta;
  }

  private async loadActions(): Promise<PendingAction[]> {
    if (!this.actions) this.actions = (await this.ctx.storage.get<PendingAction[]>('actions')) ?? [];
    return this.actions;
  }

  /** Les valeurs sont limitées en taille : les gros JSON sont découpés en morceaux. */
  private async putBig(prefix: string, value: unknown) {
    const text = JSON.stringify(value);
    const old = (await this.ctx.storage.get<number>(`${prefix}:n`)) ?? 0;
    const entries: Record<string, unknown> = {};
    const n = Math.max(1, Math.ceil(text.length / CHUNK));
    for (let i = 0; i < n; i++) entries[`${prefix}:${i}`] = text.slice(i * CHUNK, (i + 1) * CHUNK);
    entries[`${prefix}:n`] = n;
    await this.ctx.storage.put(entries);
    if (old > n) await this.ctx.storage.delete(Array.from({ length: old - n }, (_, i) => `${prefix}:${n + i}`));
  }

  private async getBig<T>(prefix: string): Promise<T | null> {
    const n = (await this.ctx.storage.get<number>(`${prefix}:n`)) ?? 0;
    if (!n) return null;
    let text = '';
    for (let i = 0; i < n; i++) text += (await this.ctx.storage.get<string>(`${prefix}:${i}`)) ?? '';
    return JSON.parse(text) as T;
  }

  private async saveMeta(meta: Meta) {
    meta.updatedAt = new Date().toISOString();
    this.meta = meta;
    await this.ctx.storage.put({ meta });
    await this.ctx.storage.setAlarm(Date.now() + IDLE_MS);
  }

  private async saveActions(list: PendingAction[]) {
    this.actions = list;
    await this.ctx.storage.put({ actions: list });
  }

  // ---------- HTTP ----------

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.split('/').pop();
    if (path === 'creer' && request.method === 'POST') return this.create(request);
    const meta = await this.loadMeta();
    if (!meta) return json({ error: 'Code de partie inconnu' }, 404);
    if (path === 'infos') {
      return json({ code: meta.code, title: meta.title, players: Object.values(meta.members).map((m) => m.name), full: Object.keys(meta.members).length >= MAX_MEMBERS });
    }
    if (path === 'ws') {
      if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket') return json({ error: 'WebSocket attendu' }, 426);
      const Pair = (globalThis as unknown as { WebSocketPair: new () => Record<0 | 1, SalleSocket> }).WebSocketPair;
      const pair = new Pair();
      this.ctx.acceptWebSocket(pair[1]);
      pair[1].serializeAttachment({ playerId: null } satisfies Attachment);
      return new Response(null, { status: 101, webSocket: pair[0] } as ResponseInit);
    }
    return json({ error: 'Introuvable' }, 404);
  }

  private async create(request: Request): Promise<Response> {
    if (await this.loadMeta()) return json({ error: 'occupé' }, 409);
    const body = (await request.json()) as { code: string; playerId: unknown; token: unknown; name: unknown; state: unknown };
    if (!validId(body.playerId) || !validToken(body.token)) return json({ error: 'identité invalide' }, 400);
    const state = body.state as { campaign?: { title?: string }; characters?: unknown[] } | null;
    if (!state || typeof state !== 'object' || !Array.isArray(state.characters)) return json({ error: 'état de partie invalide' }, 400);
    const now = new Date().toISOString();
    const meta: Meta = {
      code: body.code,
      title: String(state.campaign?.title ?? 'Partie').slice(0, 120),
      hostId: body.playerId,
      members: { [body.playerId]: { name: cleanName(body.name), tokenHash: await hashToken(body.token), role: 'hote' } },
      nextActionId: 1,
      createdAt: now,
      updatedAt: now,
    };
    await this.putBig('etat', state);
    await this.putBig('annul', []);
    await this.saveActions([]);
    await this.saveMeta(meta);
    return json({ code: meta.code });
  }

  // ---------- WebSocket ----------

  async webSocketMessage(ws: SalleSocket, raw: string | ArrayBuffer) {
    // Sérialiser les écritures : deux joueurs ne doivent jamais écraser leurs demandes.
    this.messages = this.messages.then(() => this.handleMessage(ws, raw)).catch(() => {
      this.send(ws, { t: 'erreur', message: 'La demande n’a pas pu être traitée. Réessayez.' });
    });
    await this.messages;
  }

  private async handleMessage(ws: SalleSocket, raw: string | ArrayBuffer) {
    let msg: Record<string, unknown>;
    try {
      if (typeof raw !== 'string' || raw.length > MAX_STATE_CHARS + 100_000) throw new Error();
      msg = JSON.parse(raw);
    } catch {
      return this.send(ws, { t: 'erreur', message: 'Message illisible.' });
    }
    const meta = await this.loadMeta();
    if (!meta) return ws.close(4404, 'Partie supprimée');
    const att = (ws.deserializeAttachment() ?? { playerId: null }) as Attachment;
    if (msg.t === 'ping') return this.send(ws, { t: 'pong' });
    if (msg.t === 'hello') return this.hello(ws, meta, msg);
    const me = att.playerId;
    if (!me || !meta.members[me]) return this.send(ws, { t: 'erreur', message: 'Présentez-vous d’abord.' });
    const isHost = me === meta.hostId;

    switch (msg.t) {
      case 'action':
        return this.declare(ws, meta, me, msg);
      case 'retirer':
        return this.withdraw(me, isHost, msg);
      case 'etat':
        if (!isHost) return this.send(ws, { t: 'erreur', message: "Seul l'hôte peut modifier la partie." });
        return this.writeState(ws, meta, msg);
      case 'map_state':
        if (!isHost) return this.send(ws, { t: 'erreur', message: 'Seul l’hôte peut valider la carte.' });
        return this.writeMap(ws, meta, msg);
      case 'live':
        if (isHost) await this.ctx.storage.put({ mjBusy: msg.data != null });
        if (isHost) this.broadcast({ t: msg.t, data: msg.data ?? null }, ws);
        return;
      case 'des':
        if (isHost) this.broadcast({ t: msg.t, data: msg.data ?? null }, ws);
        return;
      case 'prendre-main':
        return this.takeOver(ws, meta, me);
      default:
        return this.send(ws, { t: 'erreur', message: 'Message inconnu.' });
    }
  }

  async webSocketClose(ws: SalleSocket) {
    this.forget(ws);
    const meta = await this.loadMeta();
    if (meta) this.broadcast(this.membersMessage(meta));
  }

  async webSocketError(ws: SalleSocket) {
    await this.webSocketClose(ws);
  }

  async alarm() {
    const meta = await this.loadMeta();
    if (meta && Date.now() - Date.parse(meta.updatedAt) < IDLE_MS - 60_000) return this.ctx.storage.setAlarm(Date.parse(meta.updatedAt) + IDLE_MS);
    for (const ws of this.ctx.getWebSockets()) ws.close(4404, 'Partie expirée');
    await this.ctx.storage.deleteAll();
    this.meta = null;
    this.actions = [];
  }

  private forget(ws: SalleSocket) {
    try {
      ws.serializeAttachment({ playerId: null } satisfies Attachment);
    } catch {
      // socket déjà fermé
    }
  }

  private async hello(ws: SalleSocket, meta: Meta, msg: Record<string, unknown>) {
    if (!validId(msg.playerId) || !validToken(msg.token)) return this.send(ws, { t: 'erreur', message: 'Identité invalide.', fatal: true });
    const playerId = msg.playerId;
    const hash = await hashToken(msg.token);
    const existing = meta.members[playerId];
    if (existing && existing.tokenHash !== hash) return this.send(ws, { t: 'erreur', message: 'Cette place est déjà prise.', fatal: true });
    if (!existing && Object.keys(meta.members).length >= MAX_MEMBERS) {
      return this.send(ws, { t: 'erreur', message: `La table est complète (${MAX_MEMBERS} joueurs maximum).`, fatal: true });
    }
    const name = cleanName(msg.name);
    if (!existing || existing.name !== name) {
      meta.members[playerId] = { name, tokenHash: hash, role: existing?.role ?? 'joueur' };
      await this.saveMeta(meta);
    }
    // une seule connexion par joueur : l'ancien onglet est fermé
    for (const other of this.ctx.getWebSockets()) {
      if (other !== ws && (other.deserializeAttachment() as Attachment | null)?.playerId === playerId) {
        this.forget(other);
        other.close(4000, 'Ouvert dans un autre onglet');
      }
    }
    ws.serializeAttachment({ playerId } satisfies Attachment);
    if (playerId === meta.hostId) await this.ctx.storage.put({ mjBusy: false });
    const [state, actions] = await Promise.all([this.getBig('etat'), this.loadActions()]);
    const undo = playerId === meta.hostId ? await this.getBig<unknown[]>('annul') : null;
    this.send(ws, { t: 'bienvenue', you: playerId, code: meta.code, state, undo: undo ?? [], actions, ...this.membersPayload(meta) });
    this.broadcast(this.membersMessage(meta), ws);
  }

  private async declare(ws: SalleSocket, meta: Meta, me: string, msg: Record<string, unknown>) {
    const kind = msg.kind as ActionKind;
    const payload = msg.payload as Record<string, unknown> | null;
    if (!KINDS.includes(kind) || !payload || typeof payload !== 'object') return this.send(ws, { t: 'erreur', message: 'Action invalide.' });
    if (JSON.stringify(payload).length > 8000) return this.send(ws, { t: 'erreur', message: 'Action trop longue.' });
    let list = await this.loadActions();
    if (list.length >= MAX_PENDING) return this.send(ws, { t: 'erreur', message: "Trop d'actions en attente." });
    const state = await this.getBig<{ characters: Array<{ id: string; playerId?: string | null; companion?: boolean }>; currentLocationId?: string }>('etat');
    if (kind === 'map_move') {
      if (!this.onlineIds().has(meta.hostId) || await this.ctx.storage.get('mjBusy')) return this.send(ws, { t: 'erreur', message: 'Attendez que l’hôte soit connecté et que le MJ ait terminé.' });
      if (Date.now() - (meta.mapMovedAt?.[me] ?? 0) < 200) return this.send(ws, { t: 'erreur', message: 'Déplacement trop rapide. Réessayez.' });
      if (!['x', 'y', 'fromX', 'fromY'].every((k) => Number.isInteger(payload[k]) && Number(payload[k]) >= 0 && Number(payload[k]) < (k.includes('Y') || k === 'y' ? 10 : 14)) || typeof payload.locationId !== 'string' || payload.locationId !== state?.currentLocationId) {
        return this.send(ws, { t: 'erreur', message: 'Déplacement de carte invalide ou lieu obsolète.' });
      }
      const own = state?.characters.some((c) => c.id === payload.characterId && c.playerId === me && !c.companion);
      if (!own) return this.send(ws, { t: 'erreur', message: 'Ce pion n’est pas le vôtre. Seul le MJ déplace les PNJ et les compagnons.' });
      if (list.some((a) => a.kind === 'map_move' && a.playerId === me)) return this.send(ws, { t: 'erreur', message: 'Un déplacement est déjà en attente.' });
      meta.mapMovedAt = { ...meta.mapMovedAt, [me]: Date.now() };
      const action: PendingAction = { id: meta.nextActionId++, playerId: me, kind, payload, at: new Date().toISOString() };
      await this.saveActions([...list, action]); await this.saveMeta(meta); this.broadcast({ t: 'action', action }); return;
    }
    if (kind === 'character') {
      if (state?.characters.some((c) => c.playerId === me)) return this.send(ws, { t: 'erreur', message: 'Vous avez déjà un personnage.' });
      list = list.filter((a) => !(a.kind === 'character' && a.playerId === me));
    } else {
      const pc = state?.characters.find((c) => c.id === payload.characterId);
      if (!pc || pc.playerId !== me) return this.send(ws, { t: 'erreur', message: "Ce personnage n'est pas le vôtre." });
      // une seule action par personnage : la nouvelle remplace l'ancienne tant que le MJ n'a pas répondu
      const replaced = list.filter((a) => a.kind !== 'character' && a.kind !== 'map_move' && a.kind !== 'xcard' && kind !== 'xcard' && a.payload.characterId === pc.id);
      if (replaced.length) {
        list = list.filter((a) => !replaced.includes(a));
        this.broadcast({ t: 'retirees', ids: replaced.map((a) => a.id) });
      }
    }
    const action: PendingAction = { id: meta.nextActionId++, playerId: me, kind, payload, at: new Date().toISOString() };
    await this.saveActions([...list, action]);
    await this.saveMeta(meta);
    this.broadcast({ t: 'action', action });
  }

  private async withdraw(me: string, isHost: boolean, msg: Record<string, unknown>) {
    const ids = Array.isArray(msg.ids) ? msg.ids.filter((x): x is number => typeof x === 'number') : [];
    const list = await this.loadActions();
    const gone = list.filter((a) => ids.includes(a.id) && (isHost || a.playerId === me));
    if (!gone.length) return;
    await this.saveActions(list.filter((a) => !gone.includes(a)));
    this.broadcast({ t: 'retirees', ids: gone.map((a) => a.id), reason: msg.reason === 'rejetee' ? 'rejetee' : undefined });
  }

  private async writeMap(ws: SalleSocket, meta: Meta, msg: Record<string, unknown>) {
    const state = await this.getBig<{ currentLocationId?: string; maps?: Record<string, unknown>; updatedAt?: string }>('etat');
    const map = msg.map as { tiles?: unknown[]; positions?: object } | null;
    if (!state || msg.locationId !== state.currentLocationId || !map || !Array.isArray(map.tiles) || map.tiles.length !== 140 || !map.positions || typeof map.positions !== 'object' || JSON.stringify(map).length > 32_000) {
      return this.send(ws, { t: 'erreur', message: 'Carte invalide ou lieu obsolète.' });
    }
    const locationId = state.currentLocationId!;
    state.maps = { ...state.maps, [locationId]: map };
    state.updatedAt = new Date().toISOString();
    const list = await this.loadActions();
    const ids = Array.isArray(msg.resolved) ? msg.resolved : [];
    const resolved = list.filter((a) => a.kind === 'map_move' && ids.includes(a.id)).map((a) => a.id);
    await this.putBig('etat', state);
    await this.saveActions(list.filter((a) => !resolved.includes(a.id)));
    await this.saveMeta(meta);
    this.broadcast({ t: 'map_state', locationId, map, resolved }, ws);
    this.send(ws, { t: 'ok', ref: null, resolved });
  }

  private async writeState(ws: SalleSocket, meta: Meta, msg: Record<string, unknown>) {
    const state = msg.state as { campaign?: { title?: string }; characters?: unknown[] } | null;
    if (!state || typeof state !== 'object' || !Array.isArray(state.characters)) return this.send(ws, { t: 'erreur', message: 'État invalide.' });
    await this.putBig('etat', state);
    if (Array.isArray(msg.undo)) await this.putBig('annul', msg.undo.slice(-MAX_UNDO));
    const done = Array.isArray(msg.resolved) ? msg.resolved.filter((x): x is number => typeof x === 'number') : [];
    if (done.length) {
      const list = await this.loadActions();
      await this.saveActions(list.filter((a) => !done.includes(a.id)));
    }
    meta.title = String(state.campaign?.title ?? meta.title).slice(0, 120);
    await this.saveMeta(meta);
    // l'hôte a déjà l'état : on ne le lui renvoie pas
    this.broadcast({ t: 'etat', state, resolved: done }, ws);
    this.send(ws, { t: 'ok', ref: msg.ref ?? null, resolved: done });
  }

  private async takeOver(ws: SalleSocket, meta: Meta, me: string) {
    if (me === meta.hostId) return;
    if (this.onlineIds().has(meta.hostId)) return this.send(ws, { t: 'erreur', message: "L'hôte est toujours connecté." });
    const old = meta.members[meta.hostId];
    if (old) old.role = 'joueur';
    meta.members[me].role = 'hote';
    meta.hostId = me;
    await this.ctx.storage.put({ mjBusy: false });
    await this.saveMeta(meta);
    const undo = (await this.getBig<unknown[]>('annul')) ?? [];
    this.send(ws, { t: 'hote', undo });
    this.broadcast(this.membersMessage(meta));
  }

  // ---------- diffusion ----------

  private onlineIds(): Set<string> {
    const ids = new Set<string>();
    for (const ws of this.ctx.getWebSockets()) {
      const id = (ws.deserializeAttachment() as Attachment | null)?.playerId;
      if (id) ids.add(id);
    }
    return ids;
  }

  private membersPayload(meta: Meta) {
    const online = this.onlineIds();
    return {
      hostId: meta.hostId,
      members: Object.entries(meta.members).map(([playerId, m]) => ({ playerId, name: m.name, role: m.role, online: online.has(playerId) })),
    };
  }

  private membersMessage(meta: Meta) {
    return { t: 'membres', ...this.membersPayload(meta) };
  }

  private send(ws: SalleSocket, data: unknown) {
    try {
      ws.send(JSON.stringify(data));
    } catch {
      // connexion fermée entre-temps
    }
  }

  private broadcast(data: unknown, except?: SalleSocket) {
    const text = JSON.stringify(data);
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except || !(ws.deserializeAttachment() as Attachment | null)?.playerId) continue;
      try {
        ws.send(text);
      } catch {
        // ignorée
      }
    }
  }
}
