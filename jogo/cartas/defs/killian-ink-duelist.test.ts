import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { temPalavrasChave } from '../../testes/padroes.ts';

describe('Killian, Ink Duelist', () => {
  it('vínculo com a vida e menace', () => expect(temPalavrasChave('Killian, Ink Duelist', 'lifelink', 'menace')).toBe(true));
  it('mágica que mira criatura custa {2} a menos, mas não a parte colorida', () => {
    const tg = setup({ battlefield: [['Killian, Ink Duelist', 'Swamp'], ['Indomitable Ancients']], hand: [['Infernal Grasp'], []] });
    // Infernal Grasp custa {1}{B}: com a redução sobra {B}
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp');
    expect(tg.state.zones.stack.length).toBe(1);
    const tg2 = setup({ battlefield: [['Killian, Ink Duelist', 'Sol Ring'], ['Indomitable Ancients']], hand: [['Infernal Grasp'], []] });
    expect(tg2.canCast('Infernal Grasp')).toBe(false);
  });
  it('mágica que não mira criatura não fica mais barata', () => {
    const tg = setup({ battlefield: [['Killian, Ink Duelist', 'Swamp'], []], hand: [["Night's Whisper"], []] });
    expect(tg.canCast("Night's Whisper")).toBe(false);
  });
});
