import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Hugh, First of Many';

describe(N, () => {
  it('CR 702.56a: a mágica de artefato com replicar pago duas vezes é copiada duas vezes; as cópias viram fichas', () => {
    const tg = setup({ battlefield: [[N, ...Array(8).fill('Island')], []], hand: [['Steel Overseer'], []] });
    tg.number('quantas vezes', 2).cast('Steel Overseer').resolveAll();
    const ids = tg.all('Steel Overseer');
    expect(ids).toHaveLength(3);
    expect(ids.filter((id) => tg.state.objects[id].isToken)).toHaveLength(2);
  });

  it('mágicas que não são de artefato não têm replicar', () => {
    const tg = setup({ battlefield: [[N, ...Array(8).fill('Plains')], []], hand: [['Wall of Omens'], []] });
    let perguntou = false;
    tg.script.push((d) => { if (d.prompt.includes('quantas vezes')) perguntou = true; return null; });
    tg.cast('Wall of Omens').resolveAll();
    expect(perguntou).toBe(false);
    expect(tg.all('Wall of Omens')).toHaveLength(1);
  });
});
