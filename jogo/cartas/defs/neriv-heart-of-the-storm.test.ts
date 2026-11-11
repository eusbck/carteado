import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { dealDamage, putOntoBattlefield } from '../../motor/api.ts';

const N = 'Neriv, Heart of the Storm';

describe(N, () => {
  it('a criatura que entrou neste turno causa o dobro do dano; as outras não', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients'], []], hand: [['Dragon Whelp'], []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Dragon Whelp', 'hand', 0)!, controller: 0 }], 'effect'));
    dealDamage(tg.g, [{ source: tg.bf('Dragon Whelp'), target: { kind: 'player', id: 1 }, amount: 2, combat: false }]);
    expect(tg.life(1)).toBe(36);
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'player', id: 1 }, amount: 2, combat: false }]);
    expect(tg.life(1)).toBe(34);
  });
});
