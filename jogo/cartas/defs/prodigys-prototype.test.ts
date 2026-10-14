import { describe, expect, it } from 'vitest';
import { fixture } from '../../testes/artefatos.ts';

const N = "Prodigy's Prototype";
const V = "Cultivator's Caravan";

describe(N, () => {
  it('com dois Veículos atacando, cria uma ficha Pilot só', () => {
    const tg = fixture({ battlefield: [[N, V, 'Ripjaw Raptor', 'Indomitable Ancients', 'Indomitable Ancients'], []] });
    tg.choose('Tripular:', ['Ripjaw Raptor']).choose('Tripular:', ['done']).activate(V, 'Tripular').resolveAll();
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    tg.attack([[N, 1], [V, 1]]).passTo('declareBlockers');
    expect(tg.all('Pilot')).toHaveLength(1);
    expect(tg.pt(tg.all('Pilot')[0])).toEqual([1, 1]);
  });

  it('criatura que não é Veículo atacando não dispara', () => {
    const tg = fixture({ battlefield: [[N, 'Ripjaw Raptor'], []] });
    tg.attack([['Ripjaw Raptor', 1]]).passTo('declareBlockers');
    expect(tg.all('Pilot')).toHaveLength(0);
  });
});
