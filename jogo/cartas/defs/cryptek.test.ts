import { describe, expect, it } from 'vitest';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Cryptek';

describe(N, () => {
  it('a criatura artefato escolhida que morre neste turno volta ao campo virada', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Silver Myr', 'Elvish Mystic'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('outra criatura artefato alvo')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Silver Myr']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(N).resolveAll();
    removeCard(tg, tg.bf('Silver Myr'));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Silver Myr')].tapped).toBe(true);
  });
});