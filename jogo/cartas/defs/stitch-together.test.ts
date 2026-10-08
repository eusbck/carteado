import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Stitch Together', () => {
  it('com menos de sete cartas no cemitério, a criatura vai para a mão', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [['Stitch Together'], []], graveyard: [['Wall of Omens', 'Island'], []] });
    tg.cast('Stitch Together').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Wall of Omens']);
  });
  it('com sete cartas no cemitério, a criatura vai para o campo', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp'], []], hand: [['Stitch Together'], []],
      graveyard: [['Wall of Omens', 'Island', 'Island', 'Island', 'Island', 'Island', 'Island'], []], library: [['Plains'], []],
    });
    tg.cast('Stitch Together').resolve();
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
});
