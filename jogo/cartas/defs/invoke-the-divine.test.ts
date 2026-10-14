import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Invoke the Divine';

describe(N, () => {
  it('destrói o artefato ou encantamento alvo e você ganha 4 de vida', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], ['Sol Ring', 'Baleful Strix']], hand: [[N], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('artefato ou encantamento alvo')) return null;
      opcoes = d.items.map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] };
    });
    tg.cast(N).resolveAll();
    // Baleful Strix é criatura artefato: também serve
    expect(opcoes).toEqual(['Baleful Strix', 'Sol Ring']);
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.life(0)).toBe(44);
  });
});
