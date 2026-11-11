import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const campo = () => setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Dragon Whelp', 'Indomitable Ancients'], ['Wall of Omens']], hand: [['Crux of Fate'], []] });

describe('Crux of Fate', () => {
  it('destrói todas as criaturas Dragon', () => {
    const tg = campo();
    tg.choose('modo', ['Destrua todas as criaturas Dragon']).cast('Crux of Fate').resolve();
    expect(tg.find('Dragon Whelp')).toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
  it('destrói todas as criaturas que não são Dragon', () => {
    const tg = campo();
    tg.choose('modo', ['Destrua todas as criaturas que não são Dragon']).cast('Crux of Fate').resolve();
    expect(tg.find('Dragon Whelp')).not.toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
  });
});
