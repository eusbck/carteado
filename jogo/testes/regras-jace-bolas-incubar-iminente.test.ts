// Regras novas do motor para as cartas do deck Multiverse Reforged (Jace, Multiverse Architect): fichas de duas faces
// e transformar fichas (CR 111.10i, 701.27, 712), incubar (CR 701.53), iminente (CR 702.176) e a eminência que
// funciona da zona de comando (CR 113.6b).
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { chars, isCreature, manaValue } from '../motor/chars.ts';
import { attackCandidates } from '../motor/combat.ts';
import { copiableValues, createTokens, impendingPaid, incubate, moveObjects, removeCounters, transform } from '../motor/api.ts';

const PLAINS = (n: number) => Array(n).fill('Plains');
const OVERLORD = 'Overlord of the Mistmoors';

describe('fichas de duas faces e incubar (CR 111.10i, 701.53, 712)', () => {
  it('CR 701.53a: incubar N cria uma ficha Incubator com N marcadores +1/+1; incubar 0, sem marcadores', () => {
    const tg = setup({ battlefield: [[], []] });
    const a = tg.run(incubate(tg.g, 0, 3))!;
    const b = tg.run(incubate(tg.g, 1, 0))!;
    expect(tg.state.objects[a].counters['+1/+1']).toBe(3);
    expect(tg.state.objects[b].counters['+1/+1'] ?? 0).toBe(0);
    expect(tg.state.objects[b].controller).toBe(1);
    // CR 111.10i: a frente é um artefato Incubator incolor, que não é criatura
    const c = chars(tg.g, a);
    expect([c.name, c.types, c.subtypes, c.colors, c.power, c.toughness]).toEqual(['Incubator', ['Artifact'], ['Incubator'], [], null, null]);
    expect(isCreature(tg.g, a)).toBe(false);
    expect(tg.state.objects[a].isToken).toBe(true);
  });

  it('CR 712.8e: transformada, a ficha tem só as características do verso (Phyrexian Token 0/0 incolor)', () => {
    const tg = setup({ battlefield: [PLAINS(2), []] });
    const id = tg.run(incubate(tg.g, 0, 2))!;
    tg.activate('Incubator', '{2}').resolve();
    const c = chars(tg.g, id);
    expect([c.name, c.types, c.subtypes, c.colors]).toEqual(['Phyrexian Token', ['Artifact', 'Creature'], ['Phyrexian'], []]);
    // 0/0 com dois marcadores +1/+1
    expect(tg.pt(id)).toEqual([2, 2]);
    // a habilidade da frente não está no verso
    expect(c.abilities).toEqual([]);
    expect(tg.state.log.some((l) => l.text.includes('transforma'))).toBe(true);
  });

  it('CR 701.27a: transformar uma ficha que não é de duas faces não faz nada (701.27c)', () => {
    const tg = setup({ battlefield: [[{ name: 'Soldier', token: true }], []] });
    const id = tg.bf('Soldier');
    expect(transform(tg.g, id)).toBe(false);
    expect(tg.state.objects[id].face).toBe(0);
  });

  it('CR 712.18: transformar não cria objeto novo — a criatura que já estava sob seu controle pode atacar', () => {
    const tg = setup({ battlefield: [PLAINS(2), []], library: [PLAINS(3), PLAINS(3)] });
    const id = tg.run(incubate(tg.g, 0, 1))!;
    tg.passTo('upkeep', 1);
    tg.passTo('main1', 0);
    expect(tg.state.turn.number).toBe(5);
    tg.activate('Incubator', '{2}').resolve();
    expect(tg.state.objects[id]).toBeDefined();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    expect(attackCandidates(tg.g, 0).some((x) => x.obj === id)).toBe(true);
  });

  it('CR 701.27f: a habilidade só transforma se a ficha não transformou desde que ela foi para a pilha', () => {
    const tg = setup({ battlefield: [PLAINS(4), []] });
    const id = tg.run(incubate(tg.g, 0, 1))!;
    tg.activate('Incubator', '{2}');
    tg.activate('Incubator', '{2}');
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolveAll();
    // a segunda não a desvira de volta
    expect(tg.state.objects[id].face).toBe(1);
    expect(chars(tg.g, id).name).toBe('Phyrexian Token');
  });

  it('CR 707.8a: a cópia de uma ficha de duas faces transformada entra com o verso para cima', () => {
    const tg = setup({ battlefield: [PLAINS(2), []] });
    const id = tg.run(incubate(tg.g, 0, 1))!;
    tg.activate('Incubator', '{2}').resolve();
    const [copia] = tg.run(createTokens(tg.g, 0, { copyOf: copiableValues(tg.g, id) }, 1));
    // a cópia não copia marcadores: Phyrexian Token 0/0 morre (CR 704.5f)
    expect(tg.state.objects[copia]).toBeUndefined();
    expect(tg.state.lki[copia].chars.name).toBe('Phyrexian Token');
  });

  it('fora do campo a ficha tem as características da frente (CR 712.8a) — a última informação do campo guarda o verso', () => {
    const tg = setup({ battlefield: [PLAINS(2), []] });
    const id = tg.run(incubate(tg.g, 0, 1))!;
    tg.activate('Incubator', '{2}').resolve();
    // move sem passar pelas ações de estado (que fazem a ficha no exílio deixar de existir, CR 704.5d)
    const gen = moveObjects(tg.g, [{ id, to: 'exile' }], 'exile');
    let r = gen.next();
    while (!r.done) r = gen.next(undefined as never);
    const novo = r.value[0]!;
    expect(tg.state.lki[id].chars.name).toBe('Phyrexian Token');
    expect(tg.state.objects[novo].zone).toBe('exile');
    expect(chars(tg.g, novo).name).toBe('Incubator');
  });
});

describe('iminente (CR 702.176)', () => {
  it('702.176a: o custo alternativo não muda o valor de mana da mágica de criatura na pilha (CR 118.9c)', () => {
    const tg = setup({ battlefield: [PLAINS(4), []], hand: [[OVERLORD], []] });
    tg.cast(OVERLORD, 'impending');
    const sp = tg.find(OVERLORD, 'stack')!;
    expect(manaValue(tg.g, sp)).toBe(7);
    expect(isCreature(tg.g, sp)).toBe(true);
    // só os quatro terrenos pagaram
    expect(tg.all('Plains').every((x) => tg.state.objects[x].tapped)).toBe(true);
  });

  it('702.176a: sem o custo iminente pago, marcadores de tempo não tiram o tipo criatura e não são removidos na etapa final', () => {
    const tg = setup({ battlefield: [[{ name: OVERLORD, counters: { time: 2 } }], []], library: [PLAINS(2), PLAINS(2)] });
    const id = tg.bf(OVERLORD);
    expect(impendingPaid(tg.state.objects[id])).toBe(false);
    expect(isCreature(tg.g, id)).toBe(true);
    tg.passTo('end');
    tg.passTo('cleanup');
    expect(tg.state.objects[id].counters.time).toBe(2);
  });

  it('702.176a: com o custo pago, deixa de não ser criatura assim que o último marcador sai, por qualquer motivo', () => {
    const tg = setup({ battlefield: [PLAINS(4), []], hand: [[OVERLORD], []] });
    tg.cast(OVERLORD, 'impending').resolve();
    tg.resolveAll();
    const id = tg.bf(OVERLORD);
    expect(impendingPaid(tg.state.objects[id])).toBe(true);
    expect(isCreature(tg.g, id)).toBe(false);
    removeCounters(tg.g, { kind: 'obj', id }, 'time', 3);
    expect(isCreature(tg.g, id)).toBe(false);
    removeCounters(tg.g, { kind: 'obj', id }, 'time', 1);
    expect(isCreature(tg.g, id)).toBe(true);
    expect(chars(tg.g, id).types).toEqual(['Enchantment', 'Creature']);
  });
});

describe('eminência (CR 113.6b)', () => {
  it('funciona na zona de comando e no campo, mas não no cemitério', () => {
    const terrenos = ['Plains', 'Island', 'Swamp', ...PLAINS(5)];
    const doComando = setup({ battlefield: [terrenos, []], command: [['The Ur-Sphinx'], []], hand: [['The Ur-Sphinx'], []] });
    expect(doComando.actionIds().includes(`cast:${doComando.find('The Ur-Sphinx', 'hand', 0)}:hand`)).toBe(true);
    const doCemiterio = setup({ battlefield: [terrenos, []], graveyard: [['The Ur-Sphinx'], []], hand: [['The Ur-Sphinx'], []] });
    expect(doCemiterio.actionIds().includes(`cast:${doCemiterio.find('The Ur-Sphinx', 'hand', 0)}:hand`)).toBe(false);
  });
});
