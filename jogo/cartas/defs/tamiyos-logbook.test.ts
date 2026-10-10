import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Tamiyo's Logbook";
describe(N, () => {
  it("conta só outros artefatos e conserva azul na redução; custo é congelado antes do pagamento", () => {

    const tg = setup({ battlefield: [[N, 'Island', ...Array.from({ length: 5 }, () => ({ name: 'Sol Ring', tapped: true }))], []] }); tg.activate(N).resolveAll(); expect(tg.state.zones.hand[0]).toHaveLength(1); expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    const insufficient = setup({ battlefield: [[N, ...Array(6).fill('Sol Ring')], []] }); expect(insufficient.pending?.kind === 'priority' && insufficient.pending.actions.some(a => a.kind === 'activate' && a.obj === insufficient.bf(N))).toBe(false);
  });
});
