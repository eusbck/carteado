import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Supplementation Node';

describe(N, () => {
  it('a criatura artefato que causa dano de combate a um jogador ganha um marcador +1/+1', () => {
    const tg = setup({ battlefield: [[N, { name: 'Borg', token: true }], []] });
    tg.attack([['Borg', 1]]).passTo('main2');
    expect(tg.state.objects[tg.bf('Borg')].counters['+1/+1']).toBe(1);
  });
});
