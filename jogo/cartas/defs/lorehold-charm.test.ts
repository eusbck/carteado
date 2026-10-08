import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Lorehold Charm', () => {
  it('cada oponente sacrifica um artefato que não seja ficha', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains'], ['Sol Ring', { name: 'Treasure', token: true }]], hand: [['Lorehold Charm'], []] });
    tg.choose('modo', ['Cada oponente sacrifica um artefato que não seja ficha']);
    tg.cast('Lorehold Charm').resolve();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Treasure')).not.toBeNull();
  });
  it('devolve artefato ou criatura de valor 2 ou menos', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains'], []], hand: [['Lorehold Charm'], []], graveyard: [['Sol Ring', 'Wall of Omens'], []] });
    tg.choose('modo', ['Devolva a carta de artefato ou criatura alvo com valor de mana 2 ou menos do seu cemitério ao campo']).choose('valor de mana 2 ou menos', ['Sol Ring']);
    tg.cast('Lorehold Charm').resolve();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
  it('+1/+1 e atropelar até o fim do turno', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains', 'Wall of Omens'], []], hand: [['Lorehold Charm'], []] });
    tg.choose('modo', ['As criaturas que você controla recebem +1/+1 e ganham atropelar até o fim do turno']);
    tg.cast('Lorehold Charm').resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 5]);
  });
});
