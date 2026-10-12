import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Exploding Barrel';

describe(N, () => {
  it('{T}: uma mana de qualquer cor e um marcador de pressão', () => {
    const tg = setup({ battlefield: [[N], []] });
    activateMana(tg, N, 'R');
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['R']);
    expect(tg.state.objects[tg.bf(N)].counters.pressure).toBe(1);
  });

  it('{8} menos os marcadores de pressão, {T}, sacrifique: 20 de dano na criatura alvo', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { pressure: 3 } }, ...Array(5).fill('Mountain')], ['Indomitable Ancients']] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).activate(N, 'Sacrifique').resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });
});