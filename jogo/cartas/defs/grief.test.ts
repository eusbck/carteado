import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Grief';

describe(NOME, () => {
  it('o oponente revela a mão e descarta a carta que não é terreno que você escolher', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[NOME], ['Island', 'Dark Ritual', 'Gamble']] });
    tg.choose('Grief: escolha', ['Gamble']).cast(NOME).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Gamble']);
    expect(tg.find(NOME)).not.toBeNull();
  });

  it('evocada, a habilidade de descartar e a de sacrificar disparam juntas e você escolhe a ordem', () => {
    const tg = setup({ hand: [[NOME, 'Dark Ritual'], ['Island', 'Gamble']] });
    tg.choose('Exile 1 carta preta', ['Dark Ritual']).choose('Grief: escolha', ['Gamble']).cast(NOME, 'evoke');
    expect(tg.names(0, 'exile')).toEqual(['Dark Ritual']);
    tg.resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Gamble']);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });
});
