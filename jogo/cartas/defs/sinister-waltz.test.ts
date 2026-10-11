import { describe, expect, it } from 'vitest';
import { exile } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Sinister Waltz';
const terrenos = ['Swamp', 'Swamp', 'Swamp', 'Mountain', 'Mountain'];
const tres = ['Vampire Nighthawk', 'Elvish Mystic', 'Silver Myr'];

describe(N, () => {
  it('das três cartas de criatura alvo, duas voltam ao campo ao acaso e a outra vai para o fundo do grimório', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []], graveyard: [[...tres, 'Hex'], []], library: [['Swamp'], []] });
    tg.choose('três cartas de criatura alvo', tres).cast(N).resolveAll();
    const noCampo = tg.names(0, 'battlefield').filter((n) => tres.includes(n));
    expect(noCampo).toHaveLength(2);
    const fundo = tg.names(0, 'library').at(-1)!;
    expect(tres).toContain(fundo);
    expect(noCampo).not.toContain(fundo);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Hex', N].sort());
  });

  it('com só dois alvos ainda legais na resolução, os dois voltam e nada vai para o fundo', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []], graveyard: [tres, []], library: [['Swamp'], []] });
    tg.choose('três cartas de criatura alvo', tres).cast(N);
    tg.run(exile(tg.g, [tg.state.zones.graveyard[0].find((id) => tg.state.objects[id].def === 'Silver Myr')!]));
    tg.resolveAll();
    expect(tg.names(0, 'battlefield').filter((n) => tres.includes(n)).sort()).toEqual(['Elvish Mystic', 'Vampire Nighthawk']);
    expect(tg.names(0, 'library')).toEqual(['Swamp']);
  });

  it('com menos de três cartas de criatura no cemitério, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []], graveyard: [['Vampire Nighthawk', 'Elvish Mystic'], []] });
    expect(tg.canCast(N)).toBe(false);
  });
});
