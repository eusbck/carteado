import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const N = 'Vedalken Engineer';

describe(N, () => {
  it('duas manas de uma cor, só para artefatos: paga o Sol Ring, não uma criatura comum', () => {
    expect(alternativasDeMana(N)).toEqual(['BB', 'GG', 'RR', 'UU', 'WW']);
    const tg = setup({ battlefield: [[N], []], hand: [['Sol Ring', 'Scavenging Ooze'], []] });
    expect(tg.canCast('Scavenging Ooze')).toBe(false);
    tg.cast('Sol Ring').resolve();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });

  it('paga a habilidade de um artefato', () => {
    const tg = setup({ battlefield: [[N, 'Peacewalker Colossus', "Cultivator's Caravan"], []] });
    // {1}{W} do Colossus: o Engineer dá {W}{W}
    tg.activate('Peacewalker Colossus', '{1}{W}').resolve();
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});
