import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Galvanic Iteration';
const lib = Array(12).fill('Forest');

describe(N, () => {
  it('copia a próxima mágica instantânea ou de feitiço que você conjurar no turno, uma vez só', () => {
    // Cut a Deal: o oponente compra 1 e você compra 1; copiada, acontece duas vezes
    const tg = setup({ battlefield: [['Island', 'Mountain', ...Array(6).fill('Plains')], []], hand: [[N, 'Cut a Deal', 'Cut a Deal'], []], library: [lib, lib] });
    tg.cast(N).resolveAll();
    tg.cast('Cut a Deal').resolveAll();
    expect(tg.names(1, 'hand')).toHaveLength(2);
    expect(tg.names(0, 'hand')).toHaveLength(1 + 2);
    // a mágica seguinte não é copiada
    tg.cast('Cut a Deal').resolveAll();
    expect(tg.names(1, 'hand')).toHaveLength(3);
  });

  it('conjurada pela retrospectiva, é exilada e copia a mágica seguinte', () => {
    const tg = setup({ battlefield: [['Island', 'Mountain', ...Array(4).fill('Plains')], []], hand: [['Cut a Deal'], []], graveyard: [[N], []], library: [lib, lib] });
    tg.cast(N, 'flashback').resolveAll();
    expect(tg.names(0, 'exile')).toEqual([N]);
    tg.cast('Cut a Deal').resolveAll();
    expect(tg.names(1, 'hand')).toHaveLength(2);
  });

  it('duas Galvanic Iteration seguidas: a segunda é copiada e a mágica seguinte é copiada duas vezes', () => {
    const tg = setup({ battlefield: [['Island', 'Mountain', 'Island', 'Mountain', ...Array(3).fill('Plains')], []], hand: [[N, N, 'Cut a Deal'], []], library: [lib, lib] });
    tg.cast(N).resolveAll();
    tg.cast(N).resolveAll();
    tg.cast('Cut a Deal').resolveAll();
    // a original e duas cópias
    expect(tg.names(1, 'hand')).toHaveLength(3);
  });

  it('no turno seguinte, o efeito já acabou', () => {
    const tg = setup({ battlefield: [['Island', 'Mountain', ...Array(3).fill('Plains')], []], hand: [[N, 'Cut a Deal'], []], library: [lib, lib] });
    tg.cast(N).resolveAll();
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    const antes = tg.names(1, 'hand').length;
    tg.cast('Cut a Deal').resolveAll();
    expect(tg.names(1, 'hand')).toHaveLength(antes + 1);
  });
});
