import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const C = 'Ultimate Magic: Holy';

describe(C, () => {
  it('da mão: suas permanentes ficam indestrutíveis, mas o dano a você não é prevenido', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Elvish Mystic'], ['Indomitable Ancients']], hand: [[C], []] });
    tg.cast(C).resolve();
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'indestructible')).toBe(true);
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'player', id: 0 }, amount: 2, combat: false }]);
    expect(tg.life(0)).toBe(38);
  });
  it('predita e conjurada do exílio: também previne todo o dano a você neste turno', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Plains')], ['Indomitable Ancients']], hand: [[C], []], library: [['Opt', 'Opt'], ['Opt', 'Opt']] });
    tg.answer({ kind: 'priority', action: `foretell:${tg.find(C, 'hand', 0)}` });
    tg.settle();
    tg.passTo('upkeep', 0);
    tg.passTo('main1', 0);
    tg.cast(C, 'foretell').resolve();
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'player', id: 0 }, amount: 5, combat: false }]);
    expect(tg.life(0)).toBe(40);
  });
});
