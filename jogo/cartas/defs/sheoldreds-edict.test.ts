import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = "Sheoldred's Edict";

describe(NOME, () => {
  it('modo ficha: cada oponente sacrifica uma ficha de criatura, não a que não é ficha', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Indomitable Ancients', { name: 'Thrull', token: true }]], hand: [[NOME], []] });
    tg.choose('modo', ['Cada oponente sacrifica uma ficha de criatura à escolha dele']);
    tg.cast(NOME).resolve();
    expect(tg.find('Thrull')).toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
  });

  it('modo não ficha: cada oponente sacrifica uma criatura que não é ficha', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Indomitable Ancients', { name: 'Thrull', token: true }]], hand: [[NOME], []] });
    tg.choose('modo', ['Cada oponente sacrifica uma criatura que não é ficha à escolha dele']);
    tg.cast(NOME).resolve();
    expect(tg.find('Thrull')).not.toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });
});
