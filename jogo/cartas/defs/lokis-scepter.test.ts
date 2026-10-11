import { describe, expect, it } from 'vitest';
import { controllerOf, tap } from '../../motor/api.ts';
import { chars, hasKw } from '../../motor/chars.ts';
import { activateMana, enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Loki's Scepter";
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('ao entrar, rouba a criatura alvo até o fim do turno, desvirada, como Villain e com ímpeto', () => {
    const tg = setup({ battlefield: [[], ['Indomitable Ancients']], hand: [[N], []], library: [lib, lib] });
    const anciao = tg.bf('Indomitable Ancients');
    tap(tg.g, anciao);
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(controllerOf(tg.g, anciao)).toBe(0);
    expect(tg.state.objects[anciao].tapped).toBe(false);
    expect(chars(tg.g, anciao).subtypes).toContain('Villain');
    expect(hasKw(tg.g, anciao, 'haste')).toBe(true);
    tg.passTo('main1', 1);
    expect(controllerOf(tg.g, anciao)).toBe(1);
    expect(chars(tg.g, anciao).subtypes).not.toContain('Villain');
  });

  it('{T}: adiciona uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[N], []] });
    activateMana(tg, N, 'B');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['B']);
  });
});
