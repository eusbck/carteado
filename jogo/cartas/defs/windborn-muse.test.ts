import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Windborn Muse';

describe(NOME, () => {
  it('atacar você custa {2} por criatura; sem pagar, não ataca', () => {
    const tg = setup({ active: 1, battlefield: [[NOME], ['Indomitable Ancients']] });
    let custos: number[] | undefined;
    tg.script.push((d) => {
      if (d.kind !== 'attackers') return null;
      custos = d.candidates[0]?.costs;
      return { kind: 'attackers', attacks: [] };
    });
    tg.passTo('main2', 1);
    expect(custos).toEqual([2]);
    expect(tg.life(0)).toBe(40);
  });
});
