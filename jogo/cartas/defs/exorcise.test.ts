import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Exorcise';

describe(N, () => {
  it('exila artefato, encantamento ou criatura com força 4 ou mais', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Sol Ring', 'Always Watching', 'Thieving Amalgam', 'Slither Blade']], hand: [[N], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('força 4 ou mais alvo')) return null;
      opcoes = d.items.map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Thieving Amalgam')!.id] };
    });
    tg.cast(N).resolveAll();
    // Slither Blade (força 1) não serve
    expect(opcoes).toEqual(['Always Watching', 'Sol Ring', 'Thieving Amalgam']);
    expect(tg.find('Thieving Amalgam', 'exile')).not.toBeNull();
  });
});
