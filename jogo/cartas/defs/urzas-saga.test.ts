import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Urza's Saga";

describe(N, () => {
  it('os capítulos I e II dão habilidades que ficam; o III busca um artefato de custo {0} ou {1}', () => {
    const tg = setup({ active: 1, battlefield: [[{ name: N, counters: { lore: 1 } }, 'Plains', 'Plains'], []], library: [['Island', 'Island', 'Arcade Cabinet', 'Sol Ring', 'Lotus Petal', 'Island'], Array(4).fill('Island')] });
    const saga = tg.bf(N);
    // capítulo II no seu turno
    tg.passTo('main1', 0).resolveAll();
    tg.activate(N, 'Construct').resolveAll();
    expect(tg.all('Construct')).toHaveLength(1);
    // capítulo III no turno seguinte
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('custo de mana {0} ou {1}')) return null;
      const ativos = d.items.filter((i) => !(i as { disabled?: boolean }).disabled).map((i) => i.label).sort();
      expect(ativos).toEqual(['Lotus Petal', 'Sol Ring']);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] };
    });
    tg.passTo('upkeep', 1).passTo('main1', 0).resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.state.objects[saga]?.zone).not.toBe('battlefield');
  });
});