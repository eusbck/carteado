import { describe, expect, it } from 'vitest';
import { chars, destroy, hasKw, manaValue, putOntoBattlefield } from '../../motor/api.ts';
import { enterCard, fixture, runEffect } from '../../testes/artefatos.ts';

const N = 'Sapling Nursery';

describe(N, () => {
  it('CR 702.41a: cada Floresta sua, inclusive não básica e virada, reduz o custo genérico', () => {
    const tg = fixture({ battlefield: [['Forest', 'Forest', ...Array.from({ length: 4 }, () => ({ name: 'Breeding Pool', tapped: true }))], []], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(true);
    tg.cast(N).resolveAll();
    expect(manaValue(tg.g, tg.bf(N))).toBe(8);
    expect(tg.all('Treefolk')).toHaveLength(0);
    const semFlorestas = fixture({ battlefield: [['Forest', 'Forest', 'Plains', 'Plains'], []], hand: [[N], []] });
    expect(semFlorestas.canCast(N)).toBe(false);
    const soDoOponente = fixture({ battlefield: [['Forest', 'Forest'], Array(6).fill('Forest')], hand: [[N], []] });
    expect(soDoOponente.canCast(N)).toBe(false);
  });

  it('a afinidade nunca reduz os dois símbolos verdes', () => {
    const tg = fixture({ battlefield: [['Forest', ...Array.from({ length: 7 }, () => ({ name: 'Forest', tapped: true }))], []], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
    const duas = fixture({ battlefield: [['Forest', 'Forest', ...Array.from({ length: 6 }, () => ({ name: 'Forest', tapped: true }))], []], hand: [[N], []] });
    expect(duas.canCast(N)).toBe(true);
    duas.cast(N).resolveAll();
    expect(duas.find(N)).not.toBeNull();
  });

  it('cria uma ficha verde de Ent 3/4 com alcance por terreno seu que entra', () => {
    const tg = fixture({ battlefield: [[N], []], hand: [['Forest', 'Plains', 'Island'], []] });
    tg.play('Forest').resolveAll();
    runEffect(tg, putOntoBattlefield(tg.g, [
      { id: tg.find('Plains', 'hand')!, controller: 0 },
      { id: tg.find('Island', 'hand')!, controller: 0 },
    ], 'effect'));
    tg.resolveAll();
    enterCard(tg, 'Mountain', 1);
    tg.resolveAll();
    const fichas = tg.all('Treefolk');
    expect(fichas).toHaveLength(3);
    for (const id of fichas) {
      expect(tg.state.objects[id].isToken).toBe(true);
      expect(tg.pt(id)).toEqual([3, 4]);
      expect(chars(tg.g, id).colors).toEqual(['G']);
      expect(chars(tg.g, id).subtypes).toEqual(['Treefolk']);
      expect(hasKw(tg.g, id, 'reach')).toBe(true);
    }
  });

  it('exila como custo e protege apenas seus Ents e Florestas até o fim do turno', () => {
    const tg = fixture({ battlefield: [[N, 'Forest', 'Breeding Pool', 'Plains', 'Indomitable Ancients', 'Llanowar Elves'], ['Forest', 'Indomitable Ancients']] });
    const floresta = tg.bf('Forest', 0);
    const piscina = tg.bf('Breeding Pool');
    const ent = tg.bf('Indomitable Ancients', 0);
    const planicie = tg.bf('Plains');
    const elfo = tg.bf('Llanowar Elves');
    tg.activate(N, 'exile este encantamento');
    expect(tg.find(N)).toBeNull();
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(hasKw(tg.g, ent, 'indestructible')).toBe(false);
    tg.resolveAll();
    for (const id of [floresta, piscina, ent]) expect(hasKw(tg.g, id, 'indestructible')).toBe(true);
    for (const id of [planicie, elfo, tg.bf('Forest', 1), tg.bf('Indomitable Ancients', 1)]) expect(hasKw(tg.g, id, 'indestructible')).toBe(false);
    runEffect(tg, destroy(tg.g, [floresta, piscina, ent, planicie, elfo]));
    expect(tg.find('Plains')).toBeNull();
    expect(tg.find('Llanowar Elves')).toBeNull();
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).toBe(ent);
    tg.passTo('upkeep', 1);
    for (const id of [floresta, piscina, ent]) expect(hasKw(tg.g, id, 'indestructible')).toBe(false);
  });

  it('CR 611.2c: protege quem existe na resolução, sem afetar quem entra depois', () => {
    const tg = fixture({ battlefield: [[N, 'Forest', 'Forest'], []] });
    tg.activate(N, 'exile este encantamento');
    const antes = enterCard(tg, 'Breeding Pool', 0)!;
    tg.resolveAll();
    expect(hasKw(tg.g, antes, 'indestructible')).toBe(true);
    const depois = enterCard(tg, 'Forest', 0)!;
    expect(hasKw(tg.g, depois, 'indestructible')).toBe(false);
    expect(tg.all('Treefolk')).toHaveLength(0);
  });
});
