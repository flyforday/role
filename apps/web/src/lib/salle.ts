import type { GameState, MapMoveInput, NewCharacterInput, SceneMap } from '@veillee/engine';
import type { PlayerAction } from '@veillee/prompts';
import { workerBase } from './settings';
import type { UndoEntry } from './storage';

/** Parties en ligne : une « salle » sur le relais, rejointe avec un code de 6 caractères. Aucun compte. */

export type ActionKind = 'action' | 'attack' | 'xcard' | 'character' | 'map_move';

export interface RoomAction {
  id: number;
  playerId: string;
  kind: ActionKind;
  payload: PlayerAction | NewCharacterInput | MapMoveInput;
  at: string;
}

export interface RoomMember {
  playerId: string;
  name: string;
  role: 'hote' | 'joueur';
  online: boolean;
}

export type ServerMessage =
  | { t: 'map_state'; locationId: string; map: SceneMap; resolved: number[] }
  | { t: 'bienvenue'; you: string; code: string; state: GameState; undo: UndoEntry[]; actions: RoomAction[]; hostId: string; members: RoomMember[] }
  | { t: 'membres'; hostId: string; members: RoomMember[] }
  | { t: 'action'; action: RoomAction }
  | { t: 'retirees'; ids: number[]; reason?: 'rejetee' }
  | { t: 'etat'; state: GameState; resolved: number[] }
  | { t: 'ok'; ref: unknown; resolved: number[] }
  | { t: 'live'; data: unknown }
  | { t: 'des'; data: unknown }
  | { t: 'hote'; undo: UndoEntry[] }
  | { t: 'erreur'; message: string; fatal?: boolean }
  | { t: 'pong' };

export type ClientMessage =
  | { t: 'map_state'; locationId: string; map: SceneMap; resolved: number[] }
  | { t: 'action'; kind: ActionKind; payload: RoomAction['payload'] }
  | { t: 'retirer'; ids: number[]; reason?: 'rejetee' }
  | { t: 'etat'; state: GameState; undo?: UndoEntry[]; resolved?: number[] }
  | { t: 'live' | 'des'; data: unknown }
  | { t: 'prendre-main' };

export const CODE_LENGTH = 6;
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
}

export function isValidCode(code: string): boolean {
  return code.length === CODE_LENGTH && [...code].every((c) => ALPHABET.includes(c));
}

// ---------- identité locale (remplace le compte) ----------

const ID_KEY = 'veillee:identite';
let memoryIdentity: { playerId: string; token: string } | null = null;

function randomHex(bytes: number): string {
  return [...crypto.getRandomValues(new Uint8Array(bytes))].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Identifiant de joueur + jeton secret, générés une fois et gardés dans ce navigateur. */
export function identity(): { playerId: string; token: string } {
  if (memoryIdentity) return memoryIdentity;
  try {
    const raw = localStorage.getItem(ID_KEY);
    if (raw) {
      const v = JSON.parse(raw);
      if (typeof v?.playerId === 'string' && typeof v?.token === 'string') return (memoryIdentity = v);
    }
  } catch {
    // stockage indisponible
  }
  memoryIdentity = { playerId: `j_${randomHex(8)}`, token: randomHex(24) };
  try {
    localStorage.setItem(ID_KEY, JSON.stringify(memoryIdentity));
  } catch {
    // gardé en mémoire pour cette session
  }
  return memoryIdentity;
}

// ---------- parties récentes ----------

const RECENT_KEY = 'veillee:parties-en-ligne';

export interface RecentRoom {
  code: string;
  title: string;
  host: boolean;
  at: string;
}

export function recentRooms(): RecentRoom[] {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function rememberRoom(room: Omit<RecentRoom, 'at'>) {
  const list = [{ ...room, at: new Date().toISOString() }, ...recentRooms().filter((r) => r.code !== room.code)].slice(0, 12);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // rien
  }
}

export function forgetRoom(code: string) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentRooms().filter((r) => r.code !== code)));
  } catch {
    // rien
  }
}

// ---------- API ----------

async function readError(res: Response): Promise<string> {
  try {
    return ((await res.json()) as { error?: string }).error ?? `Erreur ${res.status}`;
  } catch {
    return `Erreur ${res.status}`;
  }
}

export async function createRoom(state: GameState, name: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${workerBase()}/api/salle`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...identity(), name, state }),
    });
  } catch {
    throw new Error('Impossible de joindre le relais pour créer la partie.');
  }
  if (!res.ok) throw new Error(await readError(res));
  const { code } = (await res.json()) as { code: string };
  rememberRoom({ code, title: state.campaign.title, host: true });
  return code;
}

export async function roomInfo(code: string): Promise<{ code: string; title: string; players: string[]; full: boolean }> {
  let res: Response;
  try {
    res = await fetch(`${workerBase()}/api/salle/${code}/infos`);
  } catch {
    throw new Error('Impossible de joindre le relais.');
  }
  if (!res.ok) throw new Error(res.status === 404 ? 'Aucune partie avec ce code.' : await readError(res));
  return res.json();
}

export function inviteUrl(code: string): string {
  return `${window.location.origin}${window.location.pathname}#/rejoindre/${code}`;
}

function wsUrl(code: string): string {
  const base = workerBase() || window.location.origin;
  return `${base.replace(/^http/, 'ws')}/api/salle/${code}/ws`;
}

export type ConnectionStatus = 'connexion' | 'connecte' | 'reconnexion' | 'ferme';

/**
 * Connexion temps réel à une salle, avec reconnexion automatique (attente croissante) et battement
 * de cœur pour garder la connexion ouverte. Les messages envoyés hors connexion sont mis en attente.
 */
export class RoomConnection {
  private ws: WebSocket | null = null;
  private queue: ClientMessage[] = [];
  private attempt = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private stopped = false;

  constructor(
    private readonly code: string,
    private readonly name: string,
    private readonly onMessage: (m: ServerMessage) => void,
    private readonly onStatus: (s: ConnectionStatus) => void,
  ) {
    this.open();
  }

  private open() {
    this.onStatus(this.attempt ? 'reconnexion' : 'connexion');
    const ws = new WebSocket(wsUrl(this.code));
    this.ws = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ t: 'hello', ...identity(), name: this.name }));
    };
    ws.onmessage = (e) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(String(e.data));
      } catch {
        return;
      }
      if (msg.t === 'bienvenue') {
        this.attempt = 0;
        this.onStatus('connecte');
        const pending = this.queue;
        this.queue = [];
        pending.forEach((m) => this.send(m));
      }
      if (msg.t === 'erreur' && msg.fatal) this.stop();
      this.onMessage(msg);
    };
    ws.onclose = (e) => {
      if (this.ws !== ws) return;
      this.ws = null;
      // 4000 : ouvert dans un autre onglet ; 4404 : partie supprimée
      if (this.stopped || e.code === 4000 || e.code === 4404) {
        if (e.code === 4000) this.onMessage({ t: 'erreur', message: 'La partie a été ouverte dans un autre onglet.', fatal: true });
        if (e.code === 4404) this.onMessage({ t: 'erreur', message: "Cette partie n'existe plus.", fatal: true });
        this.stop();
        return;
      }
      this.attempt++;
      this.onStatus('reconnexion');
      const delay = Math.min(15_000, 500 * 2 ** Math.min(this.attempt, 5)) + Math.random() * 300;
      this.timer = setTimeout(() => this.open(), delay);
    };
    if (!this.heartbeat) {
      this.heartbeat = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) this.ws.send('{"t":"ping"}');
      }, 25_000);
    }
  }

  send(msg: ClientMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
    else if (msg.t !== 'live' && msg.t !== 'des') this.queue.push(msg);
  }

  /** Reconnexion immédiate (retour sur l'onglet, réseau revenu). */
  wake() {
    if (this.stopped || this.ws) return;
    if (this.timer) clearTimeout(this.timer);
    this.open();
  }

  stop() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    if (this.heartbeat) clearInterval(this.heartbeat);
    this.heartbeat = null;
    const ws = this.ws;
    this.ws = null;
    ws?.close();
    this.onStatus('ferme');
  }
}
