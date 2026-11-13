// F2: redação do diário por assento (servidor/cena.ts), regra por regra, com entradas sintéticas.
import { describe, expect, it } from 'vitest';
import type { EntradaDiario } from '../motor/diario.ts';
import type { GameEvent } from '../motor/events.ts';
import { eventosPara } from '../servidor/cena.ts';

let seq = 0;
function ent(ev: GameEvent, vis: EntradaDiario['vis'] = {}, extra: Partial<EntradaDiario> = {}): EntradaDiario {
  return { seq: seq++, lote: 1, turno: 3, etapa: 'main1', ev, vis, ...extra };
}

/** os ids de objeto que aparecem nos eventos (qualquer número em campos de id) */
function idsDe(x: unknown): number[] {
  const out: number[] = [];
  const andar = (v: unknown, k: string) => {
    if (typeof v === 'number' && ['id', 'fonte', 'a'].includes(k)) out.push(v);
    else if (Array.isArray(v)) v.forEach((y) => andar(y, k === 'ids' || k === 'bloqueios' ? 'id' : k));
    else if (v && typeof v === 'object') for (const [kk, vv] of Object.entries(v)) andar(vv, kk);
  };
  andar(x, '');
  return out;
}

const zona = (o: Partial<Extract<GameEvent, { type: 'zone' }>>): GameEvent => ({ type: 'zone', obj: 20, old: 10, from: 'hand', to: 'stack', card: 7, owner: 1, controller: 1, cause: 'cast', token: false, ...o });

describe('cena: redação por assento', () => {
  it('R1: nunca CardId nem def, nem a causa ou o abilityId', () => {
    const es = [
      ent(zona({ from: 'hand', to: 'graveyard', card: 77, cause: 'discard' }), { 10: [1], 20: 'all' }, { motivo: 'descartar' }),
      ent({ type: 'discard', player: 1, obj: 20, card: 77 }, { 20: 'all' }),
      ent({ type: 'activate', obj: 30, source: 31, player: 1, abilityId: 'Ezuri, Claw of Progress:1' }, { 30: 'all', 31: 'all' }),
    ];
    for (const a of [0, 1, null]) {
      const json = JSON.stringify(eventosPara(a, es));
      expect(json).not.toMatch(/"(card|def|cause|abilityId)"/);
      expect(json).not.toContain('77');
      expect(json).not.toContain('Ezuri');
    }
  });

  it('R2: o id só vai a quem via o objeto naquela encarnação (o antigo e o novo separados)', () => {
    // da mão do jogador 1 para a pilha: o antigo (mão) só o 1 via; o novo (pilha) é público
    const es = [ent(zona({}), { 10: [1], 20: 'all' }, { motivo: 'conjurar' })];
    expect(eventosPara(1, es)[0]).toMatchObject({ tipo: 'zona', de: { id: 10, zona: 'hand', dono: 1 }, para: { id: 20, zona: 'stack' }, motivo: 'conjurar' });
    const outro = eventosPara(0, es)[0];
    expect(outro).toMatchObject({ de: { zona: 'hand', dono: 1 }, para: { id: 20 } });
    expect(idsDe(outro)).toEqual([20]);
    expect(idsDe(eventosPara(null, es))).toEqual([20]);
  });

  it('R2: objeto sem vis não sai (negar é o padrão)', () => {
    const es = [ent({ type: 'tap', obj: 40 }), ent({ type: 'damage', source: 41, controller: 2, target: { kind: 'obj', id: 42 }, amount: 3, combat: false }, { 41: 'all' })];
    const ev = eventosPara(0, es);
    expect(ev[0]).toEqual({ seq: es[0].seq, lote: 1, tipo: 'virar' });
    expect(ev[1]).toMatchObject({ tipo: 'dano', fonte: 41, alvo: {}, quantidade: 3 });
    expect(idsDe(ev)).toEqual([41]);
  });

  it('R3: compra do adversário vira contagem; o dono recebe o id da carta na mão', () => {
    const es = [
      ent(zona({ from: 'library', to: 'hand', old: 5, obj: 50, cause: 'draw' }), { 5: [], 50: [1] }, { motivo: 'comprar' }),
      ent({ type: 'draw', player: 1, obj: 50, nth: 1 }, { 50: [1] }),
    ];
    const dele = eventosPara(1, es);
    expect(dele[0]).toMatchObject({ tipo: 'zona', de: { zona: 'library', dono: 1 }, para: { id: 50, zona: 'hand' }, motivo: 'comprar' });
    expect(dele[1]).toMatchObject({ tipo: 'comprar', jogador: 1, id: 50, n: 1 });
    for (const a of [0, 2, null]) {
      const ev = eventosPara(a, es);
      expect(idsDe(ev)).toEqual([]);
      expect(ev[0]).toMatchObject({ tipo: 'zona', de: { zona: 'library', dono: 1 }, para: { zona: 'hand', dono: 1 } });
      expect(ev[1]).toEqual({ seq: es[1].seq, lote: 1, tipo: 'comprar', jogador: 1, n: 1 });
    }
  });

  it('R4: nenhum id de grimório, nem para quem o vê (carta revelada no topo, carta que volta ao grimório)', () => {
    const es = [
      // buscar e pôr no campo: o lado do grimório vai sem id mesmo com vis 'all'
      ent(zona({ from: 'library', to: 'battlefield', old: 6, obj: 60, cause: 'search' }), { 6: 'all', 60: 'all' }, { motivo: 'buscar' }),
      // devolver ao grimório: o lado novo (no grimório) sem id
      ent(zona({ from: 'battlefield', to: 'library', old: 61, obj: 62, cause: 'tuck' }), { 61: 'all', 62: 'all' }, { motivo: 'grimorio' }),
      ent({ type: 'search', player: 1, library: 1 }),
      ent({ type: 'shuffle', player: 1 }),
    ];
    for (const a of [0, 1, null]) {
      const ev = eventosPara(a, es);
      expect(ev[0]).toMatchObject({ de: { zona: 'library' }, para: { id: 60, zona: 'battlefield' } });
      expect((ev[0] as { de: object }).de).not.toHaveProperty('id');
      expect(ev[1]).toMatchObject({ de: { id: 61 }, para: { zona: 'library' } });
      expect((ev[1] as { para: object }).para).not.toHaveProperty('id');
      expect(ev[2]).toMatchObject({ tipo: 'buscar', jogador: 1, grimorio: 1 });
      expect(ev[3]).toMatchObject({ tipo: 'embaralhar', jogador: 1 });
      expect(idsDe(ev).sort()).toEqual([60, 61]);
    }
  });

  it('vidência e vigiar: só quantas; moer: as visíveis e quantas', () => {
    const es = [
      ent({ type: 'scry', player: 2, n: 3 }),
      ent({ type: 'surveil', player: 2, n: 1 }),
      ent({ type: 'mill', player: 2, objs: [70, 71] }, { 70: 'all', 71: 'all' }),
    ];
    expect(eventosPara(0, es).map(({ seq: _s, lote: _l, ...r }) => r)).toEqual([
      { tipo: 'olhar', jogador: 2, n: 3, como: 'videncia' },
      { tipo: 'olhar', jogador: 2, n: 1, como: 'vigiar' },
      { tipo: 'moer', jogador: 2, ids: [70, 71], n: 2 },
    ]);
  });

  it('virada para baixo: o id da permanente só para quem a vê; revelar mostra a todos', () => {
    // conjurada virada para baixo (morfo): na pilha só o controlador vê; depois vira de frente
    const es = [
      ent(zona({ from: 'hand', to: 'stack', old: 80, obj: 81 }), { 80: [1], 81: [1] }, { motivo: 'conjurar' }),
      ent({ type: 'cast', obj: 81, player: 1, from: 'hand', copy: false }, { 81: [1] }),
      ent({ type: 'turnedFaceUp', obj: 82 }, { 82: 'all' }),
    ];
    const outro = eventosPara(0, es);
    expect(idsDe(outro)).toEqual([82]);
    expect(outro[1]).toEqual({ seq: es[1].seq, lote: 1, tipo: 'conjurar', jogador: 1, de: 'hand' });
    expect(outro[2]).toMatchObject({ tipo: 'transformar', id: 82, revelada: true });
    expect(idsDe(eventosPara(1, es))).toEqual([80, 81, 81, 82]);
  });

  it('zona pública: o id da virada para baixo no campo vai a todos (como na vista); o da mão alheia não', () => {
    // 82: manifestada no campo (vis só do controlador); 83: carta na mão do jogador 1
    const publico = (id: number) => id === 82;
    const es = [ent({ type: 'tap', obj: 82 }, { 82: [1] }), ent({ type: 'draw', player: 1, obj: 83, nth: 1 }, { 83: [1] })];
    expect(idsDe(eventosPara(0, es, publico))).toEqual([82]);
    expect(idsDe(eventosPara(0, es))).toEqual([]);
    expect(idsDe(eventosPara(1, es, publico))).toEqual([82, 83]);
  });

  it('pilha: começo da resolução, anulada e sem alvos, sem abilityId; dano prevenido com o controlador da fonte', () => {
    const es = [
      ent({ type: 'resolving', obj: 110, controller: 2, abilityId: 'Ezuri, Claw of Progress:1' }, { 110: 'all' }),
      ent({ type: 'countered', obj: 111, controller: 1 }, { 111: 'all' }),
      ent({ type: 'fizzled', obj: 112, controller: 1, abilityId: 'Ezuri, Claw of Progress:2' }, { 112: [1] }),
      ent({ type: 'damagePrevented', source: 113, controller: 3, target: { kind: 'player', id: 0 }, amount: 2, combat: true }, { 113: 'all' }),
    ];
    const ev = eventosPara(0, es).map(({ seq: _s, lote: _l, ...r }) => r);
    expect(ev).toEqual([
      { tipo: 'resolvendo', id: 110, controlador: 2 },
      { tipo: 'anulada', id: 111, controlador: 1 },
      { tipo: 'sem-alvos', controlador: 1 },
      { tipo: 'dano', fonte: 113, controlador: 3, alvo: { jogador: 0 }, quantidade: 2, combate: true, prevenido: true },
    ]);
    expect(JSON.stringify(ev)).not.toContain('Ezuri');
    expect(eventosPara(1, es)[2]).toMatchObject({ tipo: 'sem-alvos', id: 112 });
  });

  it('sem prioridade nem passe; sacrifício é só o motivo da zona; vida e marcadores com sinal', () => {
    const es = [
      ent({ type: 'sacrifice', player: 1, old: 90, obj: 91 }, { 90: 'all', 91: 'all' }),
      ent(zona({ from: 'battlefield', to: 'graveyard', old: 90, obj: 91, cause: 'sacrifice' }), { 90: 'all', 91: 'all' }, { motivo: 'sacrificar' }),
      ent({ type: 'lifeLoss', player: 0, amount: 2, source: null }),
      ent({ type: 'lifeGain', player: 1, amount: 4, source: 90 }, { 90: 'all' }),
      ent({ type: 'countersRemoved', target: { kind: 'player', id: 3 }, kind: 'poison', amount: 1 }),
      ent({ type: 'step', step: 'combatDamage', active: 2 }),
    ];
    const ev = eventosPara(3, es);
    expect(ev.map((e) => e.tipo)).toEqual(['zona', 'vida', 'vida', 'marcadores', 'passo']);
    expect(ev[0]).toMatchObject({ motivo: 'sacrificar' });
    expect(ev[1]).toMatchObject({ jogador: 0, quantidade: -2 });
    expect(ev[1]).not.toHaveProperty('fonte');
    expect(ev[2]).toMatchObject({ jogador: 1, quantidade: 4, fonte: 90 });
    expect(ev[3]).toMatchObject({ alvo: { jogador: 3 }, marcador: 'poison', quantidade: -1 });
    expect(ev[4]).toMatchObject({ etapa: 'combatDamage', ativo: 2 });
    expect(JSON.stringify(ev)).not.toMatch(/priorit|prioridade|passe/i);
  });

  it('combate: atacantes e bloqueios com os ids visíveis; a ordem e o lote se mantêm', () => {
    const es = [
      ent({ type: 'attackers', player: 1, attackers: [{ obj: 100, target: { kind: 'player', id: 0 } }] }, { 100: 'all' }, { lote: 7 }),
      ent({ type: 'blockers', blocks: [[101, 100]] }, { 100: 'all', 101: 'all' }, { lote: 8 }),
    ];
    const ev = eventosPara(0, es);
    expect(ev[0]).toMatchObject({ lote: 7, tipo: 'atacantes', jogador: 1, ataques: [{ id: 100, alvo: { jogador: 0 } }] });
    expect(ev[1]).toMatchObject({ lote: 8, tipo: 'bloqueadores', bloqueios: [[101, 100]] });
    expect(ev[0].seq).toBeLessThan(ev[1].seq);
  });
});
