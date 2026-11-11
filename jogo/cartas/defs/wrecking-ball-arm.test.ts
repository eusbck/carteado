import { describe, expect, it } from 'vitest';
import { addCounters } from '../../motor/api.ts';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Wrecking Ball Arm';

describe(N, () => {
  it('equipar criatura lendária {3}: só criaturas lendárias; a equipada fica com base 7/7', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Plains', 'Zetalpa, Primal Dawn', 'Indomitable Ancients'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura lendária alvo')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Zetalpa, Primal Dawn']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(N, 'Equipar criatura lendária').resolveAll();
    const z = tg.bf('Zetalpa, Primal Dawn');
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(z);
    expect(tg.pt(z)).toEqual([7, 7]);
  });

  it('equipar {7} serve para qualquer criatura sua; com 3 terrenos só a lendária', () => {
    const tg = setup({ battlefield: [[N, ...Array(7).fill('Plains'), 'Indomitable Ancients'], []] });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).activate(N, 'Equipar {7}').resolveAll();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([7, 7]);
  });

  it('CR 613.4c: marcadores e modificações de força continuam valendo sobre a base 7/7', () => {
    const tg = setup({ battlefield: [[{ name: N, attachTo: 'Indomitable Ancients' }, { name: 'Indomitable Ancients', counters: { '+1/+1': 1 } }], []] });
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([8, 8]);
  });

  it('CR 613.7: a base 7/7 vence efeitos de base anteriores e perde para os posteriores', () => {
    // a Aura antes, o Braço depois: 7/7
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains', { name: "Kenrith's Transformation", attachTo: 'Indomitable Ancients' }, 'Indomitable Ancients'], []] });
    tg.activate(N, 'Equipar {7}').resolveAll();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([7, 7]);
    // o Braço antes, a Aura depois: 3/3
    const tg2 = setup({ battlefield: [[{ name: N, attachTo: 'Indomitable Ancients' }, 'Indomitable Ancients', 'Forest', 'Forest'], []], hand: [["Kenrith's Transformation"], []] });
    expect(tg2.pt(tg2.bf('Indomitable Ancients'))).toEqual([7, 7]);
    tg2.choose('criatura', ['Indomitable Ancients']).cast("Kenrith's Transformation").resolveAll();
    expect(tg2.pt(tg2.bf('Indomitable Ancients'))).toEqual([3, 3]);
  });

  it('não pode ser bloqueada por criaturas com força 2 ou menos', () => {
    const tg = setup({ battlefield: [[{ name: N, attachTo: 'Indomitable Ancients' }, 'Indomitable Ancients'], ['Llanowar Elves', 'Serra Angel']] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    // passTo já respondeu os bloqueios; confere quem poderia bloquear
    const cands = blockCandidates(tg.g, 1);
    expect(cands.map((c) => c.obj)).toEqual([tg.bf('Serra Angel')]);
  });

  it('CR 509.1b: depois de bloqueada, baixar a força do bloqueador não a desbloqueia', () => {
    const tg = setup({ battlefield: [[{ name: N, attachTo: 'Indomitable Ancients' }, 'Indomitable Ancients'], ['Serra Angel']] });
    tg.attack([['Indomitable Ancients', 1]]).block([['Serra Angel', 'Indomitable Ancients']]).passTo('declareBlockers');
    const anjo = tg.bf('Serra Angel');
    addCounters(tg.g, { kind: 'obj', id: anjo }, '-1/-1', 2, 0);
    tg.refresh();
    expect(tg.pt(anjo)).toEqual([2, 2]);
    const at = tg.state.combat!.attackers.find((a) => a.id === tg.bf('Indomitable Ancients'))!;
    expect(at.blocked).toBe(true);
    tg.passTo('main2', 0);
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.life(1)).toBe(40);
  });
});
