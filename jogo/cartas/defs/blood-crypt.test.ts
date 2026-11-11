import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Blood Crypt';

describe(NOME, () => {
  it('pagando 2 de vida entra desvirado e produz {B} ou {R}', () => {
    const tg = setup({ hand: [[NOME], []] });
    tg.yes('Pagar 2 de vida', true).play(NOME);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(false);
    expect(tg.life(0)).toBe(38);
  });

  it('sem pagar, entra virado', () => {
    const tg = setup({ hand: [[NOME], []] });
    tg.yes('Pagar 2 de vida', false).play(NOME);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
    expect(tg.life(0)).toBe(40);
  });
});
