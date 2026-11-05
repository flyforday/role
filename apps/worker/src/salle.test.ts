import { describe, expect, it } from 'vitest';
import { isValidCode, normalizeCode, randomCode, Salle, type SalleContext, type SalleSocket } from './salle';
import { sampleState } from '../../../packages/engine/src/fixtures.test-utils';
import { mapTokens, moveOnMap } from '../../../packages/engine/src/map';

class FakeSocket implements SalleSocket {
  sent: any[] = [];
  closed: number | null = null;
  private att: unknown = null;
  send(data: string) {
    this.sent.push(JSON.parse(data));
  }
  close(code?: number) {
    this.closed = code ?? 1000;
  }
  serializeAttachment(v: unknown) {
    this.att = structuredClone(v);
  }
  deserializeAttachment() {
    return this.att;
  }
  last(t?: string) {
    const list = t ? this.sent.filter((m) => m.t === t) : this.sent;
    return list[list.length - 1];
  }
}

function fakeCtx() {
  const data = new Map<string, unknown>();
  const sockets: FakeSocket[] = [];
  const ctx: SalleContext & { data: Map<string, unknown>; sockets: FakeSocket[] } = {
    data,
    sockets,
    storage: {
      async get<T>(k: string) {
        return structuredClone(data.get(k)) as T | undefined;
      },
      async put(entries) {
        for (const [k, v] of Object.entries(entries)) data.set(k, structuredClone(v));
      },
      async delete(keys) {
        keys.forEach((k) => data.delete(k));
        return keys.length;
      },
      async deleteAll() {
        data.clear();
      },
      async setAlarm() {},
    },
    getWebSockets: () => sockets.filter((s) => s.closed === null),
    acceptWebSocket: (ws) => sockets.push(ws as FakeSocket),
  };
  return ctx;
}

const state = (chars: Array<{ id: string; playerId: string | null }> = []) => ({ campaign: { title: 'La Cloche' }, characters: chars, turn: 0 });
const HOST = { playerId: 'hote_123456', token: 'secret-hote-0123456789' };
const AMI = { playerId: 'ami_1234567', token: 'secret-ami-01234567890' };

async function setup() {
  const ctx = fakeCtx();
  const salle = new Salle(ctx);
  const res = await salle.fetch(
    new Request('https://salle/creer', { method: 'POST', body: JSON.stringify({ code: 'ABC234', ...HOST, name: 'Léo', state: state([{ id: 'pc_leo', playerId: HOST.playerId }]) }) }),
  );
  expect(res.status).toBe(200);
  // une nouvelle instance simule le réveil après hibernation : tout doit venir du stockage
  const fresh = new Salle(ctx);
  const connect = async (who: typeof HOST, name: string) => {
    const ws = new FakeSocket();
    ctx.acceptWebSocket(ws);
    ws.serializeAttachment({ playerId: null });
    await fresh.webSocketMessage(ws, JSON.stringify({ t: 'hello', ...who, name }));
    return ws;
  };
  return { ctx, salle: fresh, connect };
}

describe('codes de partie', () => {
  it('génère des codes lisibles et valides', () => {
    for (let i = 0; i < 50; i++) expect(isValidCode(randomCode())).toBe(true);
    expect(normalizeCode(' abc-234 ')).toBe('ABC234');
    expect(isValidCode('ABC10O')).toBe(false);
  });
});

describe('salle multijoueur', () => {
  it('relaie un déplacement validé à deux joueurs et retrouve la carte après reconnexion', async () => {
    const { salle, connect } = await setup();
    const host = await connect(HOST, 'Léo'), ami = await connect(AMI, 'Sam');
    const world = sampleState();
    world.characters[0].playerId = AMI.playerId;
    await salle.webSocketMessage(host, JSON.stringify({ t: 'etat', state: world }));
    const pc = mapTokens(world).find((t) => t.kind === 'pc')!;
    const payload = { characterId: pc.id, locationId: world.currentLocationId, fromX: pc.x, fromY: pc.y, x: pc.x + 1, y: pc.y };
    await salle.webSocketMessage(ami, JSON.stringify({ t: 'action', kind: 'map_move', payload }));
    const req = host.last('action').action;
    expect(req.kind).toBe('map_move');
    const result = moveOnMap(world, req.payload, [pc.id]);
    expect(result.error).toBeUndefined();
    await salle.webSocketMessage(host, JSON.stringify({ t: 'map_state', locationId: world.currentLocationId, map: result.state.maps![world.currentLocationId!], resolved: [req.id] }));
    expect(ami.last('map_state').map).toEqual(result.state.maps![world.currentLocationId!]);
    expect(ami.last('map_state')).not.toHaveProperty('log');
    await salle.webSocketMessage(ami, JSON.stringify({ t: 'map_state', locationId: world.currentLocationId, map: result.state.maps![world.currentLocationId!], resolved: [] }));
    expect(ami.last('erreur').message).toMatch(/Seul l’hôte/);
    const again = await connect(AMI, 'Sam');
    expect(again.last('bienvenue').state.maps).toEqual(result.state.maps);
  });

  it('protège les pions et refuse les coordonnées et lieux invalides', async () => {
    const { salle, connect, ctx } = await setup();
    const host = await connect(HOST, 'Léo'), ami = await connect(AMI, 'Sam');
    await salle.webSocketMessage(host, JSON.stringify({ t: 'etat', state: { ...state([{ id: 'pc_leo', playerId: HOST.playerId }]), currentLocationId: 'quai' } }));
    const payload = { characterId: 'pc_leo', locationId: 'quai', fromX: 1, fromY: 1, x: 2, y: 1 };
    await salle.webSocketMessage(ami, JSON.stringify({ t: 'action', kind: 'map_move', payload }));
    expect(ami.last('erreur').message).toMatch(/pas le vôtre/);
    for (const extra of [{ x: 14 }, { y: -1 }, { x: 1.5 }, { locationId: 'ailleurs' }]) {
      await salle.webSocketMessage(host, JSON.stringify({ t: 'action', kind: 'map_move', payload: { ...payload, ...extra } }));
      expect(host.last('erreur').message).toMatch(/invalide|obsolète/);
    }
    expect(ctx.data.get('actions')).toEqual([]);
  });

  it('conserve l’action narrative quand un mouvement arrive, et sérialise les demandes concurrentes', async () => {
    const { salle, connect, ctx } = await setup();
    const host = await connect(HOST, 'Léo'), ami = await connect(AMI, 'Sam');
    await salle.webSocketMessage(host, JSON.stringify({ t: 'etat', state: { ...state([{ id: 'pc_leo', playerId: HOST.playerId }, { id: 'pc_sam', playerId: AMI.playerId }]), currentLocationId: 'quai' } }));
    await Promise.all([
      salle.webSocketMessage(host, JSON.stringify({ t: 'action', kind: 'action', payload: { characterId: 'pc_leo', kind: 'action', text: 'je parle' } })),
      salle.webSocketMessage(ami, JSON.stringify({ t: 'action', kind: 'map_move', payload: { characterId: 'pc_sam', locationId: 'quai', fromX: 1, fromY: 1, x: 2, y: 1 } })),
    ]);
    expect((ctx.data.get('actions') as any[]).map((a) => a.kind)).toEqual(['action', 'map_move']);
    await salle.webSocketMessage(ami, JSON.stringify({ t: 'action', kind: 'action', payload: { characterId: 'pc_sam', kind: 'action', text: 'je regarde' } }));
    expect(ctx.data.get('actions')).toHaveLength(3);
  });

  it('bloque la carte pendant la narration, puis libère le verrou après reconnexion de l’hôte', async () => {
    const { salle, connect } = await setup();
    let host = await connect(HOST, 'Léo');
    await salle.webSocketMessage(host, JSON.stringify({ t: 'etat', state: { ...state([{ id: 'pc_leo', playerId: HOST.playerId }]), currentLocationId: 'quai' } }));
    await salle.webSocketMessage(host, JSON.stringify({ t: 'live', data: { streaming: 'Le MJ raconte…' } }));
    const msg = JSON.stringify({ t: 'action', kind: 'map_move', payload: { characterId: 'pc_leo', locationId: 'quai', fromX: 1, fromY: 1, x: 2, y: 1 } });
    await salle.webSocketMessage(host, msg);
    expect(host.last('erreur').message).toMatch(/MJ ait terminé/);
    host = await connect(HOST, 'Léo');
    await salle.webSocketMessage(host, msg);
    expect(host.last('action').action.kind).toBe('map_move');
  });

  it('refuse de recréer une salle existante', async () => {
    const { salle } = await setup();
    const res = await salle.fetch(new Request('https://salle/creer', { method: 'POST', body: JSON.stringify({ code: 'ABC234', ...AMI, state: state() }) }));
    expect(res.status).toBe(409);
  });

  it('accueille les joueurs avec l’état et la liste de la table', async () => {
    const { connect } = await setup();
    const host = await connect(HOST, 'Léo');
    expect(host.last('bienvenue')).toMatchObject({ hostId: HOST.playerId, state: { campaign: { title: 'La Cloche' } } });
    const ami = await connect(AMI, 'Sam');
    const hello = ami.last('bienvenue');
    expect(hello.members.map((m: any) => m.name).sort()).toEqual(['Léo', 'Sam']);
    expect(hello.undo).toEqual([]);
    expect(host.last('membres').members.find((m: any) => m.name === 'Sam').online).toBe(true);
  });

  it('protège chaque place par son jeton', async () => {
    const { connect } = await setup();
    await connect(AMI, 'Sam');
    const thief = await connect({ playerId: AMI.playerId, token: 'mauvais-jeton-000000000' }, 'Voleur');
    expect(thief.last('erreur')).toMatchObject({ fatal: true });
  });

  it('cycle complet : personnage, actions, résolution par l’hôte', async () => {
    const { ctx, salle, connect } = await setup();
    const host = await connect(HOST, 'Léo');
    const ami = await connect(AMI, 'Sam');

    await salle.webSocketMessage(ami, JSON.stringify({ t: 'action', kind: 'action', payload: { characterId: 'pc_leo', kind: 'action', text: 'je vole' } }));
    expect(ami.last('erreur').message).toMatch(/pas le vôtre/);

    await salle.webSocketMessage(ami, JSON.stringify({ t: 'action', kind: 'character', payload: { name: 'Sam' } }));
    const req = host.last('action').action;
    expect(req).toMatchObject({ kind: 'character', playerId: AMI.playerId });

    // l'hôte ajoute le personnage et résout la demande
    await salle.webSocketMessage(host, JSON.stringify({ t: 'etat', state: state([{ id: 'pc_leo', playerId: HOST.playerId }, { id: 'pc_sam', playerId: AMI.playerId }]), undo: [], resolved: [req.id] }));
    expect(ami.last('etat').resolved).toEqual([req.id]);
    expect(host.last('ok')).toBeTruthy();
    expect(host.sent.some((m) => m.t === 'etat')).toBe(false);

    await salle.webSocketMessage(ami, JSON.stringify({ t: 'action', kind: 'action', payload: { characterId: 'pc_sam', kind: 'action', text: 'je fouille' } }));
    const first = host.last('action').action;
    await salle.webSocketMessage(ami, JSON.stringify({ t: 'action', kind: 'action', payload: { characterId: 'pc_sam', kind: 'action', text: 'non, je surveille' } }));
    expect(host.last('retirees').ids).toEqual([first.id]);
    expect(ctx.data.get('actions')).toHaveLength(1);

    // un joueur peut retirer son action, pas celle d'un autre
    await salle.webSocketMessage(host, JSON.stringify({ t: 'action', kind: 'action', payload: { characterId: 'pc_leo', kind: 'action', text: 'je chante' } }));
    const leo = host.last('action').action;
    await salle.webSocketMessage(ami, JSON.stringify({ t: 'retirer', ids: [leo.id] }));
    expect(ctx.data.get('actions')).toHaveLength(2);

    // seul l'hôte écrit l'état
    await salle.webSocketMessage(ami, JSON.stringify({ t: 'etat', state: state() }));
    expect(ami.last('erreur').message).toMatch(/hôte/);

    // la narration en direct est relayée aux autres
    await salle.webSocketMessage(host, JSON.stringify({ t: 'live', data: { streaming: 'Il était' } }));
    expect(ami.last('live').data.streaming).toBe('Il était');
  });

  it('un joueur peut reprendre la main si l’hôte est parti', async () => {
    const { ctx, salle, connect } = await setup();
    const host = await connect(HOST, 'Léo');
    const ami = await connect(AMI, 'Sam');
    await salle.webSocketMessage(ami, JSON.stringify({ t: 'prendre-main' }));
    expect(ami.last('erreur').message).toMatch(/toujours connecté/);
    host.close();
    await salle.webSocketClose(host);
    await salle.webSocketMessage(ami, JSON.stringify({ t: 'prendre-main' }));
    expect(ami.last('hote')).toBeTruthy();
    expect(ami.last('membres').hostId).toBe(AMI.playerId);
  });

  it('découpe les gros états en morceaux et les relit à l’identique', async () => {
    const { ctx, salle, connect } = await setup();
    const host = await connect(HOST, 'Léo');
    const big = { ...state([{ id: 'pc_leo', playerId: HOST.playerId }]), log: Array.from({ length: 3000 }, (_, i) => ({ id: i, text: 'x'.repeat(400) })) };
    await salle.webSocketMessage(host, JSON.stringify({ t: 'etat', state: big }));
    expect(ctx.data.get('etat:n')).toBeGreaterThan(1);
    const again = await connect(HOST, 'Léo');
    expect(again.last('bienvenue').state.log).toHaveLength(3000);
    expect(host.closed).toBe(4000); // l'ancien onglet est fermé
  });

  it('répond aux infos publiques et 404 pour un code inconnu', async () => {
    const { salle } = await setup();
    const infos = await (await salle.fetch(new Request('https://salle/infos'))).json();
    expect(infos).toMatchObject({ code: 'ABC234', title: 'La Cloche', players: ['Léo'] });
    const empty = new Salle(fakeCtx());
    expect((await empty.fetch(new Request('https://salle/infos'))).status).toBe(404);
  });
});
