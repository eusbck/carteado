import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Venser's Journal";
const lib = Array(12).fill('Island');

describe(N, () => {
  it('sem tamanho máximo de mão; na sua manutenção, ganha 1 de vida por carta na mão', () => {
    const tg = setup({ battlefield: [[N], []], hand: [Array(9).fill('Island'), Array(9).fill('Island')], library: [lib, lib] });
    // você não descarta na limpeza; o oponente descarta até sete (compra a oitava e descarta de novo no turno dele)
    tg.passTo('upkeep', 1);
    expect(tg.names(0, 'hand')).toHaveLength(9);
    tg.passTo('main1', 0);
    // nove na mão na manutenção (a compra do turno vem depois)
    expect(tg.life(0)).toBe(49);
    expect(tg.names(1, 'hand')).toHaveLength(7);
  });
});
