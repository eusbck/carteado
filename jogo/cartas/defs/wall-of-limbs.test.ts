import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { gainLife } from '../../motor/api.ts';

describe('Wall of Limbs', () => {
  it('um marcador por evento de ganho de vida; X usa a força com os marcadores', () => {
    const tg = setup({ battlefield: [['Wall of Limbs', ...Array(7).fill('Swamp')], []] });
    gainLife(tg.g, 0, 5, null);
    tg.refresh().resolveAll();
    gainLife(tg.g, 0, 1, null);
    tg.refresh().resolveAll();
    expect(tg.pt(tg.bf('Wall of Limbs'))).toEqual([2, 5]);
    tg.choose('jogador alvo', ['Bruno']);
    tg.activate('Wall of Limbs').resolve();
    expect(tg.life(1)).toBe(38);
  });
});
