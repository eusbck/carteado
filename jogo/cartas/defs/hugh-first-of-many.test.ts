import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Hugh, First of Many', () => {
  it('mágicas de artefato têm replicar {2}{U}', () => {
    const tg = setup({ battlefield: [['Hugh, First of Many', ...Array(3).fill('Island')], []], hand: [['Ornithopter'], []] });
    tg.number('replicar', 1);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('replicar') ? { kind: 'select', ids: [d.items.find((i) => /Pagar|1/.test(i.label))?.id ?? d.items[0].id] } : null));
    tg.cast('Ornithopter').resolveAll();
    expect(tg.all('Ornithopter').length).toBe(2);
  });
});
