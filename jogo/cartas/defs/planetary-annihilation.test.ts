import { describe, expect, it } from 'vitest';
import { isLand } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Planetary Annihilation';

describe(N, () => {
  it('cada jogador fica com seis terrenos e sacrifica o resto; 6 de dano a cada criatura', () => {
    const tg = setup({
      battlefield: [[...Array(8).fill('Mountain'), 'Indomitable Ancients'], [...Array(4).fill('Forest'), 'Tunneling Geopede']],
      hand: [[N], []],
    });
    tg.cast(N).resolve();
    const terrenos = (p: number) => tg.state.zones.battlefield.filter((id) => isLand(tg.g, id) && tg.state.objects[id].controller === p).length;
    expect(terrenos(0)).toBe(6);
    expect(terrenos(1)).toBe(4);
    expect(tg.find('Tunneling Geopede')).toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
  });
});
