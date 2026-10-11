import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Midnight Arsonist';

describe(N, () => {
  it('destrói até X artefatos sem habilidade de mana; o artefato com habilidade de mana não é alvo', () => {
    // X = 2 (ela mesma e o Nighthawk); Glass-Cast Heart e Bag of Holding não têm habilidade de mana, Sol Ring tem
    const tg = setup({ battlefield: [['Vampire Nighthawk'], ['Glass-Cast Heart', 'Bag of Holding', 'Sol Ring']] });
    tg.choose('artefatos alvo', ['Glass-Cast Heart', 'Bag of Holding']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([3, 2]);
    expect(tg.names(1, 'battlefield')).toEqual(['Sol Ring']);
  });

  it('Sol Ring não pode ser escolhido', () => {
    const tg = setup({ battlefield: [[], ['Sol Ring']] });
    tg.choose('artefatos alvo', ['Sol Ring']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
});
