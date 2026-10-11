import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Franklin Richards, Ascendant';

describe(N, () => {
  it('no início do combate, descobre 6 se você conjurou uma mágica que não é de criatura neste turno', () => {
    // Zetalpa (valor de mana 8) é pulada; Rapacious Dragon (5) é a descoberta
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Sol Ring'], []], library: [['Forest', 'Zetalpa, Primal Dawn', 'Rapacious Dragon', ...Array(8).fill('Forest')], Array(8).fill('Forest')] });
    expect(tg.pt(tg.bf(N))).toEqual([6, 6]);
    tg.cast('Sol Ring').resolveAll();
    tg.yes('Descobrir', true);
    tg.passTo('declareAttackers');
    expect(tg.find('Rapacious Dragon')).not.toBeNull();
    expect(tg.state.zones.exile).toHaveLength(0);
  });

  it('sem mágica que não é de criatura no turno, não descobre', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Rapacious Dragon', ...Array(8).fill('Forest')], Array(8).fill('Forest')] });
    tg.passTo('declareAttackers');
    expect(tg.find('Rapacious Dragon')).toBeNull();
    expect(tg.state.zones.library[0]).toHaveLength(9);
  });
});
