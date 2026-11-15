import { describe, expect, it } from 'vitest';
import { becomeCopy, castSpell, chars, copySpell, counter, hasKw, moveObjects, untilEndOfTurn } from '../../motor/api.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup, type TestGame } from '../../testes/harness.ts';

const N = 'Three Steps Ahead';
const M = ['+ {1}{U} — Anule', '+ {3} — Crie', '+ {2} — Compre'];
function modos(tg: TestGame, ...indices: number[]) {
  tg.script.push((d) => d.kind === 'select' && d.prompt.includes('modo')
    ? { kind: 'select', ids: indices.map((i) => d.items.find((item) => item.label.startsWith(M[i]))!.id) } : null);
  return tg;
}

describe(N, () => {
  it('escolhe apenas a compra sem precisar de alvos e paga três manas', () => {
    const tg = setup({ battlefield: [Array(3).fill('Island'), []], hand: [[N], []], library: [['Forest', 'Swamp', 'Plains'], []] });
    modos(tg, 2).choose('Descarte', ['Swamp']).cast(N).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    expect(tg.names(0, 'graveyard')).toEqual(['Swamp', N]);
    expect(tg.all('Island').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
  it('o modo de anular exige pagar {1}{U} além do custo {U}', () => {
    const tg = setup({ active: 1, battlefield: [Array(3).fill('Island'), ['Plains', 'Plains']], hand: [[N], ['Wall of Omens']] });
    tg.cast('Wall of Omens').pass();
    modos(tg, 0).choose('mágica alvo', ['Wall of Omens']).cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.all('Island').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
  it('a ficha copia as características impressas, sem marcadores ou efeitos temporários', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Island'), { name: 'Indomitable Ancients', tapped: true, counters: { '+1/+1': 2 } }], []], hand: [[N], []] });
    const original = tg.bf('Indomitable Ancients');
    untilEndOfTurn({ g: tg.g, you: 0, source: original }, [original], [{ k: 'pt', p: 3, t: 3 }, { k: 'addKeyword', kw: 'flying' }]);
    tg.refresh();
    modos(tg, 1).choose('artefato ou criatura alvo', ['Indomitable Ancients']).cast(N).resolve();
    const copia = tg.all('Indomitable Ancients').find((id) => id !== original)!;
    expect(tg.state.objects[copia].isToken).toBe(true);
    expect(tg.state.objects[copia].tapped).toBe(false);
    expect(tg.state.objects[copia].counters).toEqual({});
    expect(tg.pt(copia)).toEqual([2, 10]);
    expect(hasKw(tg.g, copia, 'flying')).toBe(false);
  });
  it('pode copiar uma ficha', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Island'), { name: 'Fish', token: true }], []], hand: [[N], []] });
    modos(tg, 1).choose('artefato ou criatura alvo', ['Fish']).cast(N).resolve();
    expect(tg.all('Fish')).toHaveLength(2);
    for (const id of tg.all('Fish')) expect([tg.pt(id), chars(tg.g, id).colors]).toEqual([[1, 1], ['U']]);
  });
  it('copiar uma permanente que já é cópia preserva seus valores copiados', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Island'), 'Indomitable Ancients', 'Sol Ring'], []], hand: [[N], []] });
    const original = tg.bf('Indomitable Ancients');
    becomeCopy({ g: tg.g, you: 0, source: original }, original, tg.bf('Sol Ring'));
    tg.refresh();
    modos(tg, 1).choose('artefato ou criatura alvo', [original]).cast(N).resolve();
    const copia = tg.state.zones.battlefield.find((id) => tg.state.objects[id].isToken)!;
    expect(chars(tg.g, copia).name).toBe('Sol Ring');
    expect(chars(tg.g, copia).types).toEqual(['Artifact']);
  });
  it('a ficha também dispara a habilidade de entrada da criatura copiada', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Island'), 'Wall of Omens'], []], hand: [[N], []], library: [['Forest', 'Plains'], []] });
    modos(tg, 1).choose('artefato ou criatura alvo', ['Wall of Omens']).cast(N).resolveAll();
    expect(tg.all('Wall of Omens')).toHaveLength(2);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
  it('os três modos resolvem na ordem escrita, pagando oito manas e mantendo valor de mana 1', () => {
    const tg = setup({ active: 1, battlefield: [[...Array(8).fill('Island'), 'Sol Ring'], ['Plains', 'Plains']], hand: [[N], ['Wall of Omens']], library: [['Forest', 'Swamp', 'Plains'], []] });
    tg.cast('Wall of Omens').pass();
    modos(tg, 2, 1, 0).choose('mágica alvo', ['Wall of Omens']).choose('artefato ou criatura alvo', ['Sol Ring']).cast(N);
    expect(chars(tg.g, tg.state.zones.stack.at(-1)!).manaValue).toBe(1);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Descarte')) return null;
      expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
      expect(tg.all('Sol Ring')).toHaveLength(2);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Swamp')!.id] };
    });
    tg.resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.all('Sol Ring')).toHaveLength(2);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    // Oito manas gastas: cada terreno vira por uma, ou Sol Ring paga duas delas.
    const gastas = tg.all('Island').filter((id) => tg.state.objects[id].tapped).length
      + (tg.all('Sol Ring').some((id) => !tg.state.objects[id].isToken && tg.state.objects[id].tapped) ? 2 : 0);
    expect(gastas).toBe(8);
  });
  it('CR 608.2b: se todos os alvos ficam ilegais, o modo de compra também não acontece', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Island'), 'Sol Ring'], []], hand: [[N], []], library: [['Forest', 'Swamp'], []] });
    modos(tg, 1, 2).choose('artefato ou criatura alvo', ['Sol Ring']).cast(N);
    runEffect(tg, moveObjects(tg.g, [{ id: tg.bf('Sol Ring'), to: 'graveyard' }], 'effect'));
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'library')).toEqual(['Forest', 'Swamp']);
  });
  it('CR 608.2b: com um alvo legal, o modo de compra acontece mesmo que outro alvo fique ilegal', () => {
    const tg = setup({ active: 1, battlefield: [[...Array(8).fill('Island'), 'Sol Ring'], ['Plains', 'Plains']], hand: [[N], ['Wall of Omens']], library: [['Forest', 'Swamp', 'Plains'], []] });
    tg.cast('Wall of Omens').pass();
    const criatura = tg.state.zones.stack[0];
    modos(tg, 0, 1, 2).choose('mágica alvo', ['Wall of Omens']).choose('artefato ou criatura alvo', ['Sol Ring']).choose('Descarte', ['Swamp']).cast(N);
    runEffect(tg, counter(tg.g, criatura));
    tg.resolve();
    expect(tg.all('Sol Ring')).toHaveLength(2);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
  it('CR 707.10: a cópia conserva os modos e os custos adicionais pagos', () => {
    const tg = setup({ battlefield: [Array(3).fill('Island'), []], hand: [[N], []], library: [['Forest', 'Swamp', 'Plains', 'Mountain', 'Sol Ring'], []] });
    modos(tg, 2).cast(N);
    runEffect(tg, copySpell(tg.g, tg.state.zones.stack[0], 0));
    tg.choose('Descarte', ['Swamp']).choose('Descarte', ['Mountain']).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Forest', 'Plains']);
    expect(tg.state.turnStats[0].cardsDrawn).toBe(4);
  });
  it('conjurar sem pagar o custo de mana exige pagar o custo do modo escolhido', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [[N], []], library: [['Forest', 'Swamp', 'Plains'], []] });
    modos(tg, 2).choose('Descarte', ['Swamp']);
    expect(runEffect(tg, castSpell(tg.g, 0, tg.find(N, 'hand')!, { key: 'teste', label: 'Sem pagar o custo de mana', zone: 'hand', free: true, duringResolution: true }))).not.toBeNull();
    expect(tg.all('Island').every((id) => tg.state.objects[id].tapped)).toBe(true);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
});
