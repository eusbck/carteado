import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Trail of Crumbs';
const lib = ['Infernal Grasp', 'Wall of Omens', 'Forest', 'Forest', 'Forest', 'Forest'];

describe(N, () => {
  it('quando entra, cria uma Food', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []], library: [lib, lib] });
    tg.cast(N).resolveAll();
    expect(tg.all('Food')).toHaveLength(1);
  });

  it('sacrificar uma Food e pagar {1} põe uma carta de permanente do topo na mão e o resto no fundo', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest', { name: 'Food', token: true }], []], library: [lib, lib] });
    tg.yes('Pagar {1}', true).choose('Trail of Crumbs: você pode revelar', ['Wall of Omens']);
    tg.activate('Food').resolveAll();
    expect(tg.life(0)).toBe(43);
    expect(tg.names(0, 'hand')).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'library').at(-1)).toBe('Infernal Grasp');
    expect(tg.names(0, 'library')[0]).toBe('Forest');
  });

  it('sem pagar, nada acontece', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest', { name: 'Food', token: true }], []], library: [lib, lib] });
    tg.yes('Pagar {1}', false);
    tg.activate('Food').resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'library')[0]).toBe('Infernal Grasp');
  });
});
