import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { canBlock } from '../../motor/combat.ts';
import { destroy } from '../../motor/api.ts';

const N = 'Tribble Cluster';

describe(N, () => {
  it('cresce no início do seu combate e, ao morrer, cria Tribbles iguais à força, que não bloqueiam', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 1 } }], ['Elvish Mystic']] });
    tg.passTo('declareAttackers');
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    const fichas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Tribble');
    expect(fichas.length).toBe(3);
    expect(canBlock(tg.g, fichas[0], tg.bf('Elvish Mystic'))).toBe(false);
  });
});
