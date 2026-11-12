import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Sheltering Landscape';

describe(N, () => {
  it('sacrifica e busca uma Montanha, Floresta ou Planície básica, virada; Ilha não aparece', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Island', 'Plains'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind === 'select' && d.prompt.includes('Montanha, Floresta ou Planície')) {
        opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label);
        return { kind: 'select', ids: [d.items.find((i) => i.label.includes('Plains'))!.id] };
      }
      return null;
    });
    tg.activate(N, 'Sacrifique').resolve();
    expect(tg.find(N)).toBeNull();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    expect(opcoes.some((l) => l.includes('Island'))).toBe(false);
  });
});
