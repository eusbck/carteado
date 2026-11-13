import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Cursed Totem';

describe(N, () => {
  it('a habilidade de mana de uma criatura também não pode ser ativada', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', 'Island'], []], hand: [['Ponder'], []] });
    const elfo = tg.bf('Elvish Mystic');
    expect(tg.actionIds().some((a) => a.startsWith('mana:') && a.includes(`${elfo}|`))).toBe(false);
    expect(tg.actionIds().some((a) => a.startsWith('mana:'))).toBe(true);
  });
  it('habilidades ativadas de artefatos que não são criaturas continuam', () => {
    const tg = setup({ battlefield: [[N, { name: 'Grim Monolith', tapped: true }, 'Island', 'Island', 'Island', 'Island'], []] });
    tg.activate('Grim Monolith', '{4}').resolve();
    expect(tg.state.objects[tg.bf('Grim Monolith')].tapped).toBe(false);
  });
  it('a ciclagem de uma carta de criatura na mão continua', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], hand: [['Vedalken Aethermage'], []], library: [['Spellseeker'], []] });
    tg.choose('Wizard', ['Spellseeker']).activate('Vedalken Aethermage').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Spellseeker']);
  });
});
