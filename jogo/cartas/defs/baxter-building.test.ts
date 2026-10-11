import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Baxter Building';

function acaoDeMana(tg: ReturnType<typeof setup>, obj: number, rotulo: string): string {
  const d = tg.pending;
  if (!d || d.kind !== 'priority') throw new Error('sem prioridade');
  return d.actions.find((a) => a.id.startsWith(`mana:${obj}|`) && a.label.includes(rotulo))!.id;
}

describe(NOME, () => {
  it('{T}: adicione {C}', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    tg.answer({ kind: 'priority', action: acaoDeMana(tg, tg.bf(NOME), '{C}') });
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['C']);
  });
  it('{4}, {T}: quatro manas em qualquer combinação de cores, escolhidas ao ativar', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring'], []] });
    for (const s of tg.all('Sol Ring')) { tg.answer({ kind: 'priority', action: acaoDeMana(tg, s, '{C}{C}') }); tg.settle(); }
    expect(tg.state.players[0].manaPool.length).toBe(4);
    for (const cor of ['W', 'W', 'B', 'R']) tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('cor da mana') ? { kind: 'select', ids: [cor] } : null));
    tg.answer({ kind: 'priority', action: acaoDeMana(tg, tg.bf(NOME), '{*}') });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((u) => u.type).sort()).toEqual(['B', 'R', 'W', 'W']);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
  it('{4}, {T}: compre uma carta, só com uma criatura sua de resistência 4 ou mais', () => {
    const pode = (tg: ReturnType<typeof setup>) => !!tg.pending && tg.pending.kind === 'priority' && tg.pending.actions.some((a) => a.id.startsWith(`act:${tg.bf(NOME)}:`));
    expect(pode(setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring', 'Hardened Academic'], ['Wall of Omens']] }))).toBe(false);
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring', 'Wall of Omens'], []], library: [['Island'], []] });
    expect(pode(tg)).toBe(true);
    tg.activate(NOME, 'Compre').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
