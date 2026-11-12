import { describe, expect, it } from 'vitest';
import { canStartCast, castOptions } from '../../motor/priority.ts';
import { setup } from '../../testes/harness.ts';
import { forcaResistencia } from '../../testes/padroes.ts';

const N = 'Shadow of Mortality';

/** com a vida já alterada, as opções de conjurar são recalculadas na hora (a primeira decisão é montada antes) */
function podeCom(vida: number): boolean {
  const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[N], []] });
  tg.state.players[0].life = vida;
  return castOptions(tg.g, 0).some((o) => canStartCast(tg.g, 0, o));
}

describe(N, () => {
  it('7/7; com 13 de vida a menos que a inicial, custa só {B}{B}', () => {
    expect(forcaResistencia(N)).toEqual([7, 7]);
    expect(podeCom(27)).toBe(true);
    expect(podeCom(28)).toBe(false);
  });
});
