import { describe, expect, it } from 'vitest';
import { isRingBearer } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Fiery Inscription';

describe(N, () => {
  it('ao entrar, o Anel tenta você: a criatura escolhida vira o Portador do Anel', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Elvish Mystic'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(isRingBearer(tg.g, tg.bf('Elvish Mystic'))).toBe(true);
  });

  it('causa 2 de dano a cada oponente quando você conjura uma instantânea ou feitiço', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Preordain'], []], library: [Array(6).fill('Island'), []] });
    tg.cast('Preordain').resolveAll();
    expect(tg.life(1)).toBe(38);
  });
});
