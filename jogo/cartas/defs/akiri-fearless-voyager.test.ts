import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Akiri, Fearless Voyager';

describe(C, () => {
  it('ruling 2: uma compra por jogador atacado, não por criatura', () => {
    const tg = setup({ players: 3, multiplayer: true, battlefield: [[C, { name: 'Basilisk Collar', attachTo: 'Elvish Mystic' }, { name: 'Elvish Mystic', ready: true }, { name: 'Darksteel Plate', attachTo: 'Wall of Omens' }, { name: 'Dina, Essence Brewer', ready: true }], [], []], library: [['Opt', 'Opt', 'Opt'], ['Opt'], ['Opt']], step: 'main1' });
    const mao = tg.state.zones.hand[0].length;
    tg.attack([['Elvish Mystic', 1], ['Dina, Essence Brewer', 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.state.zones.hand[0].length).toBe(mao + 1);
  });
  it('{W}: desanexa, vira a criatura e ela ganha indestrutível; o Equipamento fica no campo', () => {
    const tg = setup({ battlefield: [[C, 'Plains', { name: 'Basilisk Collar', attachTo: 'Elvish Mystic' }, 'Elvish Mystic'], []] });
    tg.choose('Desanexe', ['Basilisk Collar']).activate(C, 'desanexar').resolve();
    const elfo = tg.bf('Elvish Mystic');
    expect(tg.state.objects[tg.bf('Basilisk Collar')].attachedTo ?? null).toBeNull();
    expect(tg.state.objects[elfo].tapped).toBe(true);
    expect(hasKw(tg.g, elfo, 'indestructible')).toBe(true);
  });
});
