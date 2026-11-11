import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Bugenhagen, Wise Elder';
// 2/10 com cinco marcadores +1/+1: 7/15
const GRANDE = { name: 'Indomitable Ancients', counters: { '+1/+1': 5 } };

describe(N, () => {
  it('na manutenção, com uma criatura de força 7 ou mais, compra uma carta', () => {
    const tg = setup({ battlefield: [[N, GRANDE], []], step: 'end', active: 1 });
    const mao = tg.names(0, 'hand').length;
    tg.passTo('upkeep', 0);
    expect(tg.names(0, 'hand').length).toBe(mao + 1);
  });

  it('sem criatura de força 7, não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients'], []], step: 'end', active: 1 });
    const mao = tg.names(0, 'hand').length;
    tg.passTo('upkeep', 0);
    expect(tg.names(0, 'hand').length).toBe(mao);
  });

  it('sem criatura de força 7 ao resolver, o gatilho não faz nada', () => {
    const tg = setup({ battlefield: [[N, GRANDE], []], step: 'end', active: 1 });
    tg.passUntil((x) => x.state.turn.step === 'upkeep' && x.state.zones.stack.length > 0);
    const mao = tg.names(0, 'hand').length;
    removeCard(tg, tg.bf('Indomitable Ancients'));
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(mao);
  });

  it('tem alcance e produz mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[N], []] });
    const id = tg.bf(N);
    expect(hasKw(tg.g, id, 'reach')).toBe(true);
    expect(tg.pending?.kind === 'priority' && tg.pending.actions.filter((a) => a.kind === 'mana' && a.obj === id).length).toBe(5);
  });
});
