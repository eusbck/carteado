import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Vision, Synthezoid Avenger';
const MARCADOR = 'Coloque um marcador +1/+1 em Vision';
const FASE = 'Vision sai de fase';

describe(N, () => {
  it('mágica conjurada fora do turno de quem conjura: marcador +1/+1 em Vision; no próprio turno, nada', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Plains', 'Plains', 'Plains'], ['Sol Ring', 'Forest', 'Forest']], hand: [['Make Your Move'], ['Silver Myr']] });
    // o jogador ativo conjura no próprio turno: não dispara
    tg.cast('Silver Myr').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    tg.pass();
    tg.choose('força 4 ou mais', ['Sol Ring']).choose('escolha', [MARCADOR]).cast('Make Your Move').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    expect(tg.find('Sol Ring')).toBeNull();
  });

  it('ou Vision sai de fase', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Plains', 'Plains', 'Plains'], ['Sol Ring']], hand: [['Make Your Move'], []] });
    tg.pass();
    tg.choose('força 4 ou mais', ['Sol Ring']).choose('escolha', [FASE]).cast('Make Your Move').resolveAll();
    expect(tg.state.objects[tg.find(N)!].phasedOut).toBe(true);
  });
});