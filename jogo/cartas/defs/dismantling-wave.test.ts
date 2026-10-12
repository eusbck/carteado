import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Dismantling Wave';

describe(N, () => {
  it('destrói até um artefato ou encantamento de cada oponente', () => {
    const tg = setup({ players: 3, battlefield: [['Plains', 'Plains', 'Plains', 'Sol Ring'], ['Sol Ring', 'High Score'], ['Arcade Cabinet']], hand: [[N], [], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('até um por oponente')) return null;
      // o seu Sol Ring não é alvo
      expect(d.items).toHaveLength(3);
      return { kind: 'select', ids: d.items.filter((i) => i.label === 'High Score' || i.label === 'Arcade Cabinet').map((i) => i.id) };
    });
    tg.cast(N).resolveAll();
    expect(tg.find('High Score')).toBeNull();
    expect(tg.find('Arcade Cabinet')).toBeNull();
    expect(tg.all('Sol Ring')).toHaveLength(2);
  });

  it('ciclando, destrói todos os artefatos e encantamentos e ainda compra a carta', () => {
    const tg = setup({ battlefield: [[...Array(8).fill('Plains'), 'Sol Ring', 'Silver Myr'], ['High Score', 'Elvish Mystic']], hand: [[N], []], library: [['Island', 'Island'], ['Island']] });
    tg.activate(N, 'Ciclagem').resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.find('High Score')).toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});