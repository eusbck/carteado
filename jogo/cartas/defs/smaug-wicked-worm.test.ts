import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { activateMana } from '../../testes/artefatos.ts';
import { createTokens, putOntoBattlefield } from '../../motor/api.ts';

const S = 'Smaug, Wicked Worm';

describe(S, () => {
  it('ao entrar, cria Tesouros virados, um por artefato dos oponentes', () => {
    const tg = setup({ battlefield: [['Sol Ring'], ['Sol Ring', 'Chromatic Orrery']], hand: [[S], []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find(S, 'hand', 0)!, controller: 0 }], 'effect'));
    tg.resolve();
    const tes = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Treasure');
    expect(tes.length).toBe(2);
    expect(tes.every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
  it('conjurando mágica com mana de Tesouro, compra uma carta e perde 1 de vida; sem Tesouro, nada', () => {
    const tg = setup({ battlefield: [[S, 'Forest'], []], hand: [['Elvish Mystic', 'Llanowar Elves'], []], library: [['Island'], []] });
    tg.run(createTokens(tg.g, 0, 'Treasure', 1));
    tg.cast('Elvish Mystic');
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    activateMana(tg, 'Treasure', 'G');
    tg.cast('Llanowar Elves');
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.life(0)).toBe(39);
  });
});
