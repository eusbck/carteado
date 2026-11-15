import { describe, expect, it } from 'vitest';
import { addEffect, dealDamage, healDamage } from '../motor/api.ts';
import { fixture as setup } from './artefatos.ts';

const W = 'Wolverine, Fierce Fighter';

describe('Curar dano', () => {
  it('CR 701.69a: remove só dano marcado; não desvira nem remove marcadores', () => {
    const tg = setup({ battlefield: [[{ name: 'Indomitable Ancients', damage: 4, tapped: true, counters: { '-1/-1': 1 } }], []] });
    const id = tg.bf('Indomitable Ancients');
    expect(healDamage(tg.g, id)).toBe(4);
    expect(tg.state.objects[id].damage).toBe(0);
    expect(tg.state.objects[id].tapped).toBe(true);
    expect(tg.state.objects[id].counters['-1/-1']).toBe(1);
  });
  it('CR 614.1a, 701.69a: cura o dano anterior em cada evento novo, mas preserva o dano novo', () => {
    const tg = setup({ battlefield: [[{ name: W, damage: 4 }], ['Indomitable Ancients']] });
    const target = { kind: 'obj' as const, id: tg.bf(W) };
    for (let i = 0; i < 3; i++) {
      dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target, amount: 3, combat: false }]);
      tg.refresh();
      expect(tg.state.objects[target.id].damage).toBe(3);
    }
  });
  it('CR 120.4b, 614.5: fontes simultâneas não apagam o dano novo umas das outras', () => {
    const tg = setup({ battlefield: [[{ name: W, damage: 4 }], ['Indomitable Ancients', 'Wall of Omens']] });
    const target = { kind: 'obj' as const, id: tg.bf(W) };
    dealDamage(tg.g, [
      { source: tg.bf('Indomitable Ancients'), target, amount: 2, combat: false },
      { source: tg.bf('Wall of Omens'), target, amount: 1, combat: false },
    ]);
    tg.refresh();
    expect(tg.state.objects[target.id].damage).toBe(3);
  });
  it('CR 120.8: dano zero não causa dano nem cura o anterior', () => {
    const tg = setup({ battlefield: [[{ name: W, damage: 4 }], ['Indomitable Ancients']] });
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'obj', id: tg.bf(W) }, amount: 0, combat: false }]);
    expect(tg.state.objects[tg.bf(W)].damage).toBe(4);
  });
  it('CR 616.1e: a ordem automática cura antes de prevenir o dano novo', () => {
    const tg = setup({ battlefield: [[{ name: W, damage: 4 }], ['Indomitable Ancients']] });
    const id = tg.bf(W);
    addEffect(tg.g, { source: id, sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [id], mods: [{ k: 'rule', id: 'rule:preventNextDamageTo', params: { to: id, left: 2 } }] });
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'obj', id }, amount: 2, combat: false }]);
    expect(tg.state.objects[id].damage).toBe(0);
  });
  it('CR 120.3d, 701.69a: curar não remove os marcadores de dano com murchar', () => {
    const tg = setup({ battlefield: [[{ name: W, damage: 2 }], ['Indomitable Ancients']] });
    const source = tg.bf('Indomitable Ancients');
    addEffect(tg.g, { source, sourceDef: '', controller: 1, duration: { kind: 'endOfTurn' }, affected: [source], mods: [{ k: 'addKeyword', kw: 'wither' }] });
    const target = { kind: 'obj' as const, id: tg.bf(W) };
    dealDamage(tg.g, [{ source, target, amount: 1, combat: false }]);
    expect(tg.state.objects[target.id].damage).toBe(0);
    expect(tg.state.objects[target.id].counters['-1/-1']).toBe(1);
    healDamage(tg.g, target.id);
    expect(tg.state.objects[target.id].counters['-1/-1']).toBe(1);
  });
  it('CR 704.5h: curar não impede destruição por toque mortífero do dano novo', () => {
    const tg = setup({ battlefield: [[{ name: W, damage: 3 }], ['Indomitable Ancients']] });
    const source = tg.bf('Indomitable Ancients');
    addEffect(tg.g, { source, sourceDef: '', controller: 1, duration: { kind: 'endOfTurn' }, affected: [source], mods: [{ k: 'addKeyword', kw: 'deathtouch' }] });
    dealDamage(tg.g, [{ source, target: { kind: 'obj', id: tg.bf(W) }, amount: 1, combat: false }]);
    tg.refresh();
    expect(tg.find(W)).toBeNull();
  });
  it('CR 613.1f: perder a habilidade impede a substituição', () => {
    const tg = setup({ battlefield: [[{ name: W, damage: 3 }], ['Indomitable Ancients']] });
    const id = tg.bf(W);
    addEffect(tg.g, { source: id, sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [id], mods: [{ k: 'loseAllAbilities' }] });
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'obj', id }, amount: 2, combat: false }]);
    tg.refresh();
    expect(tg.find(W)).toBeNull();
  });
});
