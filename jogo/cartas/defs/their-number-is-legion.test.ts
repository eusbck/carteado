import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Their Number Is Legion';

describe(N, () => {
  it('conjurada do cemitério pelo custo normal; cria X Necron Warriors virados, ganha vida pelos artefatos e é exilada', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Swamp'), 'Arcade Cabinet'], []], graveyard: [[N], []] });
    const vida = tg.life(0);
    tg.number('X', 2).cast(N, 'cemiterio').resolveAll();
    expect(tg.all('Necron Warrior')).toHaveLength(2);
    for (const id of tg.all('Necron Warrior')) expect(tg.state.objects[id].tapped).toBe(true);
    expect(tg.life(0)).toBe(vida + 3);
    expect(tg.names(0, 'exile')).toEqual([N]);
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });
});