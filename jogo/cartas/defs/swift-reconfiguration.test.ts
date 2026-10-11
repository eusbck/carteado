import { describe, expect, it } from 'vitest';
import { chars, hasKw, isCreature } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Swift Reconfiguration';
const Z = 'Zetalpa, Primal Dawn';

describe(N, () => {
  it('a criatura encantada vira um artefato Vehicle com tripular 5 e fica com as habilidades', () => {
    const tg = setup({ battlefield: [[], [Z, { name: N, attachTo: Z }, 'Indomitable Ancients', 'Thief of Sanity']], active: 1 });
    const z = tg.bf(Z);
    expect(chars(tg.g, z).types).toEqual(['Artifact']);
    expect(chars(tg.g, z).subtypes).toEqual(['Vehicle']);
    expect(chars(tg.g, z).supertypes).toContain('Legendary');
    expect(isCreature(tg.g, z)).toBe(false);
    expect(hasKw(tg.g, z, 'flying')).toBe(true);
    expect(hasKw(tg.g, z, 'crew')).toBe(true);
    // Indomitable Ancients (2) e Thief of Sanity (2) somam força 4: não dá para tripular 5
    expect(tg.actionIds().some((a) => a.startsWith('act:') && a.split(':').includes(String(z)))).toBe(false);
  });

  it('tripulada com força total 5 ou mais, volta a ser criatura até o fim do turno', () => {
    const tg = setup({ battlefield: [[Z, { name: N, attachTo: Z }, 'Master of Predicaments', 'Thief of Sanity'], []] });
    const z = tg.bf(Z);
    tg.choose('Tripular:', ['Master of Predicaments']).choose('Tripular:', ['Thief of Sanity']).choose('Tripular:', ['done']);
    tg.activate(Z, 'Tripular').resolveAll();
    expect(isCreature(tg.g, z)).toBe(true);
    expect(chars(tg.g, z).types.sort()).toEqual(['Artifact', 'Creature']);
    expect(tg.pt(z)).toEqual([4, 8]);
    tg.passTo('upkeep', 1);
    expect(isCreature(tg.g, z)).toBe(false);
  });

  it('CR 506.4: encantada enquanto ataca, sai do combate', () => {
    const tg = setup({ active: 1, battlefield: [['Plains'], [Z]], hand: [[N], []] });
    tg.attack([[Z, 0]]).passTo('declareBlockers');
    while (tg.pending?.player !== 0) tg.pass();
    tg.choose('criatura ou Vehicle', [Z]).cast(N).resolveAll();
    expect(isCreature(tg.g, tg.bf(Z))).toBe(false);
    expect(tg.state.combat?.attackers.filter((a) => !a.removed) ?? []).toHaveLength(0);
    tg.passTo('main2', 1);
    expect(tg.life(0)).toBe(40);
  });
});
