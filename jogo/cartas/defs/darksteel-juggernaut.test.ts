import { describe, expect, it } from 'vitest';
import { validateAttack } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Darksteel Juggernaut";
describe(N, () => {
  it("CDA conta artefatos e ataque é obrigatório quando gratuito", () => {

    const tg = setup({ battlefield: [[N, 'Sol Ring'], []] }); expect(tg.pt(tg.bf(N))).toEqual([2, 2]); expect(validateAttack(tg.g, 0, [])).not.toBeNull();
    const taxed = setup({ battlefield: [[N], ['Propaganda']] }); expect(validateAttack(taxed.g, 0, [])).toBeNull(); const sick = setup({ battlefield: [[{ name: N, ready: false }], []] }); expect(validateAttack(sick.g, 0, [])).toBeNull();
  });
});
