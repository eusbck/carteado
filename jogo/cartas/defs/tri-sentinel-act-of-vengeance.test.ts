import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Tri-Sentinel, Act of Vengeance';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('voar, ameaçar e atropelar; ao entrar, 3 de dano a até uma criatura de cada oponente', () => {
    const tg = setup({ players: 3, battlefield: [[], ['Indomitable Ancients', 'Elvish Mystic'], ['Elvish Mystic']], hand: [[N], [], []] });
    const anciao = tg.bf('Indomitable Ancients');
    const elfo2 = tg.bf('Elvish Mystic', 2);
    tg.choose('para cada oponente', [anciao, elfo2]);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([7, 7]);
    for (const kw of ['flying', 'menace', 'trample']) expect(hasKw(tg.g, id, kw)).toBe(true);
    expect(tg.state.objects[anciao].damage).toBe(3);
    expect(tg.names(2, 'battlefield')).toEqual([]);
    expect(tg.names(1, 'battlefield').sort()).toEqual(['Elvish Mystic', 'Indomitable Ancients']);
  });

  it('não aceita duas criaturas do mesmo oponente', () => {
    const tg = setup({ players: 3, battlefield: [[], ['Indomitable Ancients', 'Elvish Mystic'], []], hand: [[N], [], []] });
    tg.choose('para cada oponente', ['Indomitable Ancients', 'Elvish Mystic']);
    expect(() => { enterCard(tg, N, 0); tg.resolveAll(); }).toThrow();
  });

  it('desenterrar {7}: volta do cemitério com ímpeto e é exilado na etapa final', () => {
    const tg = setup({ battlefield: [[...Array(7).fill('Swamp')], []], graveyard: [[N], []], library: [lib, lib] });
    tg.activate(N, 'Desenterrar').resolveAll();
    const id = tg.bf(N);
    expect(hasKw(tg.g, id, 'haste')).toBe(true);
    tg.passTo('main1', 1);
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'exile')).toEqual([N]);
  });
});
