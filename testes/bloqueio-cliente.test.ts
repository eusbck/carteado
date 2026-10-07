// Fase 9, item 1.4: a lógica do bloqueio por cliques da mesa (cliente/src/mesa/bloqueio.ts), contra decisões de
// bloqueio de verdade do motor. A resposta montada pela mesa tem de ser a que o motor aceita.
import { describe, expect, it } from 'vitest';
import { cliqueBloqueio, podeBloquear, respostaBloqueio, type EstadoBloqueio } from '../cliente/src/mesa/bloqueio.ts';
import type { Decision, ObjId } from '../motor/types.ts';
import { setup, type SetupOptions, type TestGame } from './harness.ts';

type DBloqueio = Extract<Decision, { kind: 'blockers' }>;

/** monta o combate e para na decisão de bloqueio do `defensor` (sem responder) */
function bloqueioDe(o: SetupOptions, ataques: [string, number][], defensor: number): { tg: TestGame; d: DBloqueio } {
  const tg = setup({ step: 'beginCombat', ...o });
  tg.attack(ataques.map(([n, p]) => [n, p]));
  tg.lenient = true;
  for (let i = 0; i < 50; i++) {
    const d = tg.pending;
    if (d?.kind === 'blockers' && d.player === defensor) return { tg, d };
    if (!d) break;
    tg.answer(d.kind === 'priority' ? { kind: 'priority', action: 'pass' } : tg.respond(d));
  }
  throw new Error('a decisão de bloqueio não chegou');
}

/** uma sequência de cliques como a mesa faz: devolve o estado final e as recusas */
function clicar(d: DBloqueio, tg: TestGame, eu: number, ids: ObjId[], inicio: EstadoBloqueio = { bloqueios: {}, ativo: null }) {
  let e = inicio;
  const recusas: string[] = [];
  const atacando = new Set(tg.state.combat!.attackers.map((a) => a.id));
  for (const id of ids) {
    const o = tg.state.objects[id];
    const r = cliqueBloqueio(d, e, { id, atacando: atacando.has(id), minhaCriatura: o.controller === eu && tg.g.state.zones.battlefield.includes(id) });
    if (r && 'recusa' in r) recusas.push(r.recusa);
    else if (r) e = r;
  }
  return { e, recusas };
}

describe('fase 9 (1.4): bloqueio por cliques na mesa', () => {
  it('um bloqueador: clica na sua criatura e depois no atacante; a resposta é a que o motor aceita', () => {
    const { tg, d } = bloqueioDe({ battlefield: [['Kami of Ancient Law'], ['Goblin Electromancer']] }, [['Kami of Ancient Law', 1]], 1);
    const kami = tg.bf('Kami of Ancient Law'), goblin = tg.bf('Goblin Electromancer');
    // atacante antes do bloqueador: recusa com o motivo
    expect(clicar(d, tg, 1, [kami]).recusas).toEqual(['Clique antes na sua criatura que vai bloquear']);
    const { e, recusas } = clicar(d, tg, 1, [goblin, kami]);
    expect(recusas).toEqual([]);
    expect(e).toEqual({ bloqueios: { [goblin]: kami }, ativo: null });
    const resp = respostaBloqueio(e.bloqueios);
    expect(resp).toEqual({ kind: 'blockers', blocks: [[goblin, kami]] });
    expect(tg.game.check(1, resp)).toBeNull();
    // clicar de novo no bloqueador solta o bloqueio; clicar duas vezes na criatura desfaz a escolha
    expect(clicar(d, tg, 1, [goblin], e).e).toEqual({ bloqueios: {}, ativo: null });
    expect(clicar(d, tg, 1, [goblin, goblin]).e).toEqual({ bloqueios: {}, ativo: null });
  });

  it('vários bloqueadores no mesmo atacante (ameaça): a mesa monta os dois e o motor aceita; um só, ele recusa', () => {
    const { tg, d } = bloqueioDe({ battlefield: [["Teacher's Pest"], ['Kami of Ancient Law', 'Goblin Electromancer']] }, [["Teacher's Pest", 1]], 1);
    const pest = tg.bf("Teacher's Pest"), kami = tg.bf('Kami of Ancient Law'), goblin = tg.bf('Goblin Electromancer');
    const um = clicar(d, tg, 1, [kami, pest]).e;
    expect(tg.game.check(1, respostaBloqueio(um.bloqueios))).toMatch(/menace/);
    const dois = clicar(d, tg, 1, [goblin, pest], um).e;
    expect(dois.bloqueios).toEqual({ [kami]: pest, [goblin]: pest });
    const resp = respostaBloqueio(dois.bloqueios);
    expect(tg.game.check(1, resp)).toBeNull();
    tg.answer(resp);
    expect(tg.state.combat!.attackers[0].blockers.sort()).toEqual([kami, goblin].sort());
  });

  it('voar: a mesa não deixa marcar quem não alcança a voadora', () => {
    const { tg, d } = bloqueioDe({ battlefield: [['Drumbellower', 'Kami of Ancient Law'], ['Goblin Electromancer', 'Arboreal Grazer']] }, [['Drumbellower', 1], ['Kami of Ancient Law', 1]], 1);
    const voa = tg.bf('Drumbellower'), kami = tg.bf('Kami of Ancient Law'), goblin = tg.bf('Goblin Electromancer'), grazer = tg.bf('Arboreal Grazer');
    expect(podeBloquear(d, goblin, voa)).toBe(false);
    expect(podeBloquear(d, grazer, voa)).toBe(true);
    const { e, recusas } = clicar(d, tg, 1, [goblin, voa, kami, grazer, voa]);
    expect(recusas).toEqual(['Ela não pode bloquear essa criatura']);
    expect(e.bloqueios).toEqual({ [goblin]: kami, [grazer]: voa });
    expect(tg.game.check(1, respostaBloqueio(e.bloqueios))).toBeNull();
  });

  it('quatro jogadores: só os atacantes que atacam você podem ser bloqueados; criatura que não bloqueia é recusada', () => {
    const { tg, d } = bloqueioDe({ players: 4, battlefield: [['Kami of Ancient Law', 'Goblin Electromancer'], ['Indomitable Ancients', { name: 'Elvish Mystic', tapped: true }], ['Arboreal Grazer'], []] }, [['Kami of Ancient Law', 1], ['Goblin Electromancer', 2]], 1);
    const kami = tg.bf('Kami of Ancient Law'), goblin = tg.bf('Goblin Electromancer'), anc = tg.bf('Indomitable Ancients'), mystic = tg.bf('Elvish Mystic');
    expect(d.attackers).toEqual([kami]);
    expect(podeBloquear(d, anc, goblin)).toBe(false);
    // Goblin ataca outro jogador: recusa; a criatura virada não está entre as candidatas
    const { e, recusas } = clicar(d, tg, 1, [anc, goblin, mystic, kami]);
    expect(recusas).toEqual(['Ela não pode bloquear essa criatura', 'Essa criatura não pode bloquear']);
    expect(e.bloqueios).toEqual({ [anc]: kami });
    expect(tg.game.check(1, respostaBloqueio(e.bloqueios))).toBeNull();
    // carta de outro jogador que não ataca: o clique não faz nada
    expect(cliqueBloqueio(d, { bloqueios: {}, ativo: null }, { id: tg.bf('Arboreal Grazer'), atacando: false, minhaCriatura: false })).toBeNull();
  });

  it('sem nada marcado, a resposta é não bloquear', () => {
    expect(respostaBloqueio({})).toEqual({ kind: 'blockers', blocks: [] });
  });
});
