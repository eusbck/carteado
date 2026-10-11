import { describe, expect, it } from 'vitest';
import { addEffect, destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const C = "Chandra's Ignition";
const montanhas = Array(5).fill('Mountain');

describe(C, () => {
  it('a criatura alvo causa dano igual à força a cada outra criatura (inclusive as suas) e a cada oponente', () => {
    const tg = setup({ players: 3, battlefield: [[...montanhas, 'Rapacious Dragon', 'Wall of Omens'], ['Indomitable Ancients'], ['Elvish Mystic']], hand: [[C], [], []] });
    tg.choose('criatura alvo que você controla', ['Rapacious Dragon']).cast(C).resolve();
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(3);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.state.objects[tg.bf('Rapacious Dragon')].damage).toBe(0);
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 37, 37]);
  });
  it('só mira criatura que você controla', () => {
    const tg = setup({ battlefield: [montanhas, ['Indomitable Ancients']], hand: [[C], []] });
    expect(tg.canCast(C)).toBe(false);
  });
  it('a criatura é a fonte do dano (vínculo com a vida dela conta)', () => {
    const tg = setup({ players: 3, battlefield: [[...montanhas, { name: 'Moogle', token: true }], ['Elvish Mystic'], []], hand: [[C], [], []] });
    tg.cast(C).resolve();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect([tg.life(1), tg.life(2)]).toEqual([39, 39]);
    expect(tg.life(0)).toBe(43);
  });
  it('CR 608.2h: usa a força na resolução', () => {
    const tg = setup({ battlefield: [[...montanhas, 'Rapacious Dragon'], []], hand: [[C], []] });
    tg.cast(C);
    const d = tg.bf('Rapacious Dragon');
    addEffect(tg.g, { source: d, sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [d], mods: [{ k: 'pt', p: 2, t: 0 }] });
    tg.refresh().resolve();
    expect(tg.life(1)).toBe(35);
  });
  it('com o alvo ilegal na resolução, nada acontece', () => {
    const tg = setup({ battlefield: [[...montanhas, 'Rapacious Dragon'], ['Wall of Omens']], hand: [[C], []] });
    tg.cast(C);
    tg.run(destroy(tg.g, [tg.bf('Rapacious Dragon')]));
    tg.resolve();
    expect(tg.life(1)).toBe(40);
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(0);
  });
});
