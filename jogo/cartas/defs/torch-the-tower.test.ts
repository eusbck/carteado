import { describe, expect, it } from 'vitest';
import { addEffect, copySpell, destroy, healDamage, putOntoBattlefield, returnToHand, sacrifice } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Torch the Tower';
const PAGAR = 'Pagar: barganha (sacrifique um artefato, encantamento ou ficha)';

describe(N, () => {
  it('sem barganha causa 2 e não usa vidência', () => {
    const tg = setup({ battlefield: [['Mountain'], ['Indomitable Ancients']], hand: [[N], []], library: [['Forest', 'Swamp'], []] });
    tg.script.push((d) => { if (d.kind === 'arrange') throw new Error('Não deve usar vidência sem barganha'); return null; });
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(2);
    expect(tg.names(0, 'library')).toEqual(['Forest', 'Swamp']);
  });
  it('barganha sacrifica uma só permanente e causa 3 de dano com vidência 1', () => {
    const tg = setup({ battlefield: [['Mountain', 'Sol Ring', 'Silver Myr'], ['Indomitable Ancients']], hand: [[N], []], library: [['Forest', 'Swamp'], []] });
    tg.choose('custo adicional opcional', [PAGAR]).choose('alvo', ['Indomitable Ancients']).choose('Sacrifique', ['Silver Myr']);
    tg.script.push((d) => d.kind === 'arrange' ? { kind: 'arrange', order: d.items.map((i) => i.id), placement: Object.fromEntries(d.items.map((i) => [i.id, 'bottom'])) } : null);
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.names(0, 'library')).toEqual(['Swamp', 'Forest']);
  });
  it('exila a criatura que recebeu dano letal e não dispara sua habilidade de morrer', () => {
    const tg = setup({ battlefield: [['Mountain'], ['Greedy Freebooter']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.find('Greedy Freebooter', 'exile', 1)).not.toBeNull();
    expect(tg.all('Treasure')).toHaveLength(0);
  });
  it('morte posterior por destruição ou sacrifício também é substituída por exílio', () => {
    for (const acao of [destroy, sacrifice]) {
      const tg = setup({ battlefield: [['Mountain'], ['Indomitable Ancients']], hand: [[N], []] });
      tg.cast(N).resolveAll();
      runEffect(tg, acao(tg.g, [tg.bf('Indomitable Ancients')]));
      expect(tg.find('Indomitable Ancients', 'exile', 1)).not.toBeNull();
    }
  });
  it('também pode mirar e exilar um planeswalker que perde os últimos marcadores de lealdade', () => {
    const tg = setup({ battlefield: [['Mountain'], [{ name: 'Jace, Architect of Thought', counters: { loyalty: 2 } }]], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.find('Jace, Architect of Thought', 'exile', 1)).not.toBeNull();
  });
  it('dano totalmente prevenido não cria a substituição; dano parcialmente prevenido cria', () => {
    for (const previne of [1, 2]) {
      const tg = setup({ battlefield: [['Mountain'], ['Indomitable Ancients']], hand: [[N], []] });
      const id = tg.bf('Indomitable Ancients');
      addEffect(tg.g, { source: id, sourceDef: '', controller: 1, duration: { kind: 'endOfTurn' }, affected: [id], mods: [{ k: 'rule', id: 'rule:preventNextDamageTo', params: { to: id, left: previne } }] });
      tg.refresh().cast(N).resolveAll();
      runEffect(tg, destroy(tg.g, [id]));
      expect(tg.find('Indomitable Ancients', previne === 2 ? 'graveyard' : 'exile', 1)).not.toBeNull();
    }
  });
  it('o efeito independe das habilidades da criatura e só dura neste turno', () => {
    const tg = setup({ battlefield: [['Mountain'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const id = tg.bf('Indomitable Ancients');
    addEffect(tg.g, { source: id, sourceDef: '', controller: 1, duration: { kind: 'endOfTurn' }, affected: [id], mods: [{ k: 'loseAllAbilities' }] });
    runEffect(tg, destroy(tg.g, [id]));
    expect(tg.find('Indomitable Ancients', 'exile', 1)).not.toBeNull();
    const outro = setup({ battlefield: [['Mountain'], ['Indomitable Ancients']], hand: [[N], []] });
    outro.cast(N).resolveAll().passTo('main1', 1);
    runEffect(outro, destroy(outro.g, [outro.bf('Indomitable Ancients')]));
    expect(outro.find('Indomitable Ancients', 'graveyard', 1)).not.toBeNull();
  });
  it('o exílio acompanha o destinatário real quando o dano é redirecionado', () => {
    const tg = setup({ battlefield: [['Mountain'], ['Indomitable Ancients', 'Wall of Omens']], hand: [[N], []] });
    const wall = tg.bf('Wall of Omens');
    addEffect(tg.g, { source: wall, sourceDef: '', controller: 1, duration: { kind: 'endOfTurn' }, affected: null, mods: [{ k: 'rule', id: 'rule:redirectDamageTo', params: { controller: 1, to: wall } }] });
    tg.choose('alvo', ['Indomitable Ancients']).refresh().cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(0);
    expect(tg.state.objects[wall].damage).toBe(2);
    runEffect(tg, sacrifice(tg.g, [wall]));
    expect(tg.find('Wall of Omens', 'exile', 1)).not.toBeNull();
    runEffect(tg, destroy(tg.g, [tg.bf('Indomitable Ancients')]));
    expect(tg.find('Indomitable Ancients', 'graveyard', 1)).not.toBeNull();
  });
  it('curar o dano depois não remove a substituição da morte por exílio', () => {
    const tg = setup({ battlefield: [['Mountain'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const id = tg.bf('Indomitable Ancients');
    healDamage(tg.g, id);
    runEffect(tg, destroy(tg.g, [id]));
    expect(tg.find('Indomitable Ancients', 'exile', 1)).not.toBeNull();
  });
  it('devolver à mão não é morrer, e uma nova entrada da mesma carta não conserva o efeito', () => {
    const tg = setup({ battlefield: [['Mountain'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    runEffect(tg, returnToHand(tg.g, [tg.bf('Indomitable Ancients')]));
    const id = tg.find('Indomitable Ancients', 'hand', 1)!;
    runEffect(tg, putOntoBattlefield(tg.g, [{ id, controller: 1 }], 'effect'));
    runEffect(tg, destroy(tg.g, [tg.bf('Indomitable Ancients')]));
    expect(tg.find('Indomitable Ancients', 'graveyard', 1)).not.toBeNull();
  });
  it('CR 707.10: a cópia de uma mágica barganhada conserva a barganha sem novo sacrifício', () => {
    const tg = setup({ battlefield: [['Mountain', 'Sol Ring'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('custo adicional opcional', [PAGAR]).cast(N);
    runEffect(tg, copySpell(tg.g, tg.find(N, 'stack')!, 0));
    tg.resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
    expect(tg.find('Sol Ring')).toBeNull();
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(6);
  });
});
