import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'The Meathook Massacre';

describe(NOME, () => {
  it('conjurada com X = 2, cada criatura recebe -2/-2 e as mortes drenam', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ['Wall of Omens', 'Indomitable Ancients']], hand: [[NOME], []] });
    tg.number('X', 2);
    tg.cast(NOME).resolveAll();
    // Indomitable Ancients é 2/10; Wall of Omens 0/4 vira -2/2
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([0, 8]);
  });

  it('criatura sua morrendo faz cada oponente perder 1; do oponente, você ganha 1', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Burnished Hart'], ['Burnished Hart']], hand: [[NOME], []] });
    tg.number('X', 2);
    tg.cast(NOME).resolveAll();
    expect(tg.find('Burnished Hart')).toBeNull();
    expect(tg.life(1)).toBe(39);
    expect(tg.life(0)).toBe(41);
  });
});
