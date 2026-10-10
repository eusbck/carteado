// O ataque por cliques da mesa (cliente/src/mesa/ataque.ts) contra decisões de ataque de verdade do motor: marcar e
// desmarcar uma criatura em dois cliques, marcar várias de uma vez (retângulo, "Atacar com todas") e o selo ×n do
// leque de fichas. A resposta montada pela mesa tem de ser a que o motor aceita.
import { describe, expect, it } from 'vitest';
import { alternarLeque, cliqueAtaque, marcarVarias, type Ataques, type EstadoAtaque } from '../cliente/src/mesa/ataque.ts';
import type { Answer, Decision, ObjId, TargetRef } from '../motor/types.ts';
import { P, setup, type SetupOptions, type TestGame } from './harness.ts';

type DAtaque = Extract<Decision, { kind: 'attackers' }>;

/** passa o começo do combate e para na decisão de ataque de Ana (sem responder) */
function ataqueDe(o: SetupOptions): { tg: TestGame; d: DAtaque } {
  const tg = setup({ step: 'beginCombat', ...o });
  for (let i = 0; i < 20; i++) {
    const d = tg.pending;
    if (d?.kind === 'attackers' && d.player === 0) return { tg, d };
    if (!d) break;
    tg.answer(d.kind === 'priority' ? { kind: 'priority', action: 'pass' } : tg.respond(d));
  }
  throw new Error('a decisão de ataque não chegou');
}

const resposta = (a: Ataques): Extract<Answer, { kind: 'attackers' }> => ({ kind: 'attackers', attacks: Object.entries(a).map(([o, t]) => [Number(o), t!] as [ObjId, TargetRef]) });
const fichas = (n: number) => Array.from({ length: n }, () => ({ name: 'Goblin', token: true }));
const goblinsDe = (tg: TestGame, p: number) => tg.all('Goblin').filter((id) => tg.state.objects[id].controller === p);

/** uma sequência de cliques como a mesa faz */
function clicar(d: DAtaque, ids: ObjId[], e: EstadoAtaque = { ataques: {}, ativo: null }, ultimoAlvo: TargetRef | null = null): EstadoAtaque {
  for (const id of ids) e = cliqueAtaque(d.candidates, e, id, ultimoAlvo) ?? e;
  return e;
}

describe('ataque por cliques na mesa', () => {
  it('desmarcar leva dois cliques quando ela não é a escolhida: o primeiro a escolhe, o segundo desmarca', () => {
    const { tg, d } = ataqueDe({ battlefield: [[...fichas(6), 'Kami of Ancient Law', 'Goblin Electromancer'], ['Indomitable Ancients']] });
    const [g1, g2] = goblinsDe(tg, 0);
    const kami = tg.bf('Kami of Ancient Law');
    expect(d.candidates).toHaveLength(8);
    // um contra um: o alvo é automático, e a clicada fica escolhida
    let e = clicar(d, [g1]);
    expect(e).toEqual({ ataques: { [g1]: P(1) }, ativo: g1 });
    // a escolhida clicada de novo é desmarcada
    expect(clicar(d, [g1], e)).toEqual({ ataques: {}, ativo: null });
    // marcada mas não escolhida: o clique só a escolhe (antes, desmarcava a de cima do leque sem querer)
    e = clicar(d, [g1, g2]);
    expect(e).toEqual({ ataques: { [g1]: P(1), [g2]: P(1) }, ativo: g2 });
    e = clicar(d, [g1], e);
    expect(e).toEqual({ ataques: { [g1]: P(1), [g2]: P(1) }, ativo: g1 });
    expect(tg.game.check(0, resposta(e.ataques))).toBeNull();
    e = clicar(d, [g1], e);
    expect(e).toEqual({ ataques: { [g2]: P(1) }, ativo: null });
    // o que não pode atacar (o Ancients do oponente) não muda nada
    expect(cliqueAtaque(d.candidates, e, tg.bf('Indomitable Ancients'), null)).toBeNull();
    e = clicar(d, [kami], e);
    expect(tg.game.check(0, resposta(e.ataques))).toBeNull();
    tg.answer(resposta(e.ataques));
    expect(tg.state.combat!.attackers.map((a) => a.id).sort()).toEqual([g2, kami].sort());
  });

  it('três jogadores: sem alvo padrão a marcada fica sem alvo; com o último alvo, vai nele', () => {
    const { tg, d } = ataqueDe({ players: 3, battlefield: [[...fichas(3)], [], []] });
    const [g1, g2] = goblinsDe(tg, 0);
    expect(clicar(d, [g1])).toEqual({ ataques: { [g1]: null }, ativo: g1 });
    expect(clicar(d, [g1, g2], undefined, P(2))).toEqual({ ataques: { [g1]: P(2), [g2]: P(2) }, ativo: g2 });
    expect(tg.game.check(0, resposta({ [g1]: P(2), [g2]: P(1) }))).toBeNull();
  });

  it('marcar várias: todas as que faltam, nenhuma escolhida (o próximo oponente clicado vale para todas)', () => {
    const { tg, d } = ataqueDe({ players: 3, battlefield: [[...fichas(6), 'Kami of Ancient Law'], [], []] });
    const gs = goblinsDe(tg, 0);
    const kami = tg.bf('Kami of Ancient Law');
    // o retângulo pegou três fichas, uma delas já marcada com alvo: fica como estava
    const r = marcarVarias(d.candidates, { [gs[0]]: P(1) }, gs.slice(0, 3), null);
    expect(r).toEqual({ ataques: { [gs[0]]: P(1), [gs[1]]: null, [gs[2]]: null }, ativo: null });
    // "Atacar com todas" depois de escolher o Bruno: as novas já vão nele
    const todas = marcarVarias(d.candidates, r.ataques, d.candidates.map((c) => c.obj), P(1));
    expect(Object.keys(todas.ataques).map(Number).sort((a, b) => a - b)).toEqual([...gs, kami].sort((a, b) => a - b));
    expect(todas.ataques[kami]).toEqual(P(1));
    expect(todas.ataques[gs[1]]).toBeNull();
    // o clique no oponente (Mesa.alvoAtaque) completa as sem alvo: a declaração vale
    const completas = Object.fromEntries(Object.entries(todas.ataques).map(([o, t]) => [o, t ?? P(2)]));
    expect(tg.game.check(0, resposta(completas))).toBeNull();
  });

  it('marcar várias pula quem só ataca pagando (CR 508.1h); o clique nela ainda marca', () => {
    // um contra um com Ghostly Prison: atacar o único alvo custa {2} para cada uma
    const um = ataqueDe({ battlefield: [[...fichas(3)], ['Ghostly Prison']] });
    const gs = goblinsDe(um.tg, 0);
    expect(um.d.candidates.every((c) => c.costs?.every((n) => n > 0))).toBe(true);
    expect(marcarVarias(um.d.candidates, {}, gs, null)).toEqual({ ataques: {}, ativo: null });
    expect(alternarLeque(um.d.candidates, { ataques: {}, ativo: null }, gs, null)).toBeNull();
    expect(clicar(um.d, [gs[0]])).toEqual({ ataques: { [gs[0]]: P(1) }, ativo: gs[0] });
    // marcada à mão, o selo do leque a desmarca junto
    expect(alternarLeque(um.d.candidates, { ataques: { [gs[0]]: P(1) }, ativo: gs[0] }, gs, null)).toEqual({ ataques: {}, ativo: null });
    // três jogadores: só atacar quem tem a Prison custa; as outras entram sem alvo
    const tres = ataqueDe({ players: 3, battlefield: [[...fichas(3)], ['Ghostly Prison'], []] });
    const ts = goblinsDe(tres.tg, 0);
    const r = marcarVarias(tres.d.candidates, {}, ts, null);
    expect(r.ataques).toEqual({ [ts[0]]: null, [ts[1]]: null, [ts[2]]: null });
    expect(tres.tg.game.check(0, resposta({ [ts[0]]: P(2), [ts[1]]: P(2), [ts[2]]: P(2) }))).toBeNull();
  });

  it('o selo ×n do leque: marca as que faltam; com todas marcadas, desmarca o leque inteiro', () => {
    const { tg, d } = ataqueDe({ battlefield: [[...fichas(6), 'Goblin Electromancer'], ['Indomitable Ancients']] });
    const gs = goblinsDe(tg, 0);
    const el = tg.bf('Goblin Electromancer');
    // duas já marcadas (uma escolhida) e o Electromancer fora do leque
    const antes: EstadoAtaque = { ataques: { [gs[1]]: P(1), [gs[4]]: P(1), [el]: P(1) }, ativo: gs[4] };
    const cheio = alternarLeque(d.candidates, antes, gs, null)!;
    expect(cheio.ativo).toBeNull();
    expect(Object.keys(cheio.ataques).map(Number).sort((a, b) => a - b)).toEqual([...gs, el].sort((a, b) => a - b));
    expect(tg.game.check(0, resposta(cheio.ataques))).toBeNull();
    // todas marcadas: desmarca só o leque (o Electromancer fica)
    expect(alternarLeque(d.candidates, { ataques: cheio.ataques, ativo: el }, gs, null)).toEqual({ ataques: { [el]: P(1) }, ativo: el });
    expect(alternarLeque(d.candidates, { ataques: cheio.ataques, ativo: gs[2] }, gs, null)).toEqual({ ataques: { [el]: P(1) }, ativo: null });
    // leque de quem não pode atacar (fichas do oponente): nada a fazer
    expect(alternarLeque(d.candidates, antes, [tg.bf('Indomitable Ancients')], null)).toBeNull();
    tg.answer(resposta(cheio.ataques));
    expect(tg.state.combat!.attackers).toHaveLength(7);
  });
});
