import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

const NOME = 'Nested Shambler';

describe(NOME, () => {
  it('morre com força 3 (dois marcadores): cria três Squirrels virados', () => {
    const tg = setup({ battlefield: [[{ name: NOME, counters: { '+1/+1': 2 } }], []] });
    tg.run(destroy(tg.g, [tg.bf(NOME)]));
    tg.resolveAll();
    const esq = tg.all('Squirrel');
    expect(esq.length).toBe(3);
    expect(esq.every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
});
