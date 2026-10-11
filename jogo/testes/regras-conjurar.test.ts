// Jeitos de conjurar e custos do lote 2 (motor/conjurar-alternativo.ts): as regras gerais que as cartas citam nos
// rulings. Cada mecânica tem também os testes das cartas que a usam (cartas/defs): metamorfose em Akroma, Angel of Fury
// e Zoetic Cavern; ninjutsu em Yuriko; sneak em Dark Leo & Shredder; retraçar em Call the Skybreaker; recompra em
// Evincar's Justice; espetáculo em Body Count; sobrecarga em Cyclonic Rift e Vandalblast.
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import { discard } from '../motor/actions.ts';
import { setup } from './harness.ts';

const OCC = 'Stromkirk Occultist'; // Madness {1}{R}
const forests = Array(10).fill('Forest');

describe('loucura (CR 702.35)', () => {
  it('CR 702.35a: descartada, a carta vai para o exílio em vez do cemitério e o gatilho da loucura vai para a pilha', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], []], hand: [[OCC], []] });
    const descartadas = tg.run(discard(tg.g, 0, 1));
    // continua sendo um descarte: o efeito que mandou descartar recebe a carta descartada
    expect(descartadas).toHaveLength(1);
    expect(tg.find(OCC, 'exile')).not.toBeNull();
    expect(tg.find(OCC, 'graveyard', 0)).toBeNull();
    tg.settle();
    expect(tg.state.zones.stack).toHaveLength(1);
  });

  it('CR 702.35a: continua sendo descarte — as habilidades de "sempre que você descarta" disparam', () => {
    // Bag of Holding: sempre que você descarta uma carta, exile essa carta do seu cemitério
    const tg = setup({ battlefield: [['Bag of Holding', 'Mountain', 'Mountain'], []], hand: [[OCC], []] });
    tg.yes('Loucura', false);
    tg.run(discard(tg.g, 0, 1));
    tg.settle();
    // os dois gatilhos: o da loucura e o do Bag of Holding
    expect(tg.state.zones.stack).toHaveLength(2);
  });

  it('CR 603.3: descartada para pagar o custo de uma mágica, a loucura (e a mágica conjurada por ela) resolve antes dessa mágica', () => {
    // Thrill of Possibility: custo adicional de descartar uma carta; compre duas cartas
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Thrill of Possibility', OCC], []], library: [forests, forests] });
    tg.yes('Loucura', true);
    tg.cast('Thrill of Possibility');
    // o custo foi pago: a carta descartada está no exílio e o gatilho da loucura está acima da mágica
    expect(tg.find(OCC, 'exile')).not.toBeNull();
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    // o gatilho resolveu e a criatura foi conjurada pelo custo de loucura, acima do Thrill
    expect(tg.state.zones.stack).toHaveLength(2);
    expect(tg.find(OCC, 'exile')).toBeNull();
    tg.resolve();
    expect(tg.find(OCC)).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual([]);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Forest', 'Forest']);
    expect(tg.all('Mountain').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });

  it('CR 702.35a: descartada durante uma resolução, vai para o exílio na hora e o gatilho só vai para a pilha depois', () => {
    // Anje's Ravager: sempre que ataca, descarte a sua mão e depois compre três cartas
    const tg = setup({ battlefield: [["Anje's Ravager", 'Mountain', 'Mountain'], []], hand: [[OCC], []], library: [forests, forests] });
    let maoAoDecidir = -1;
    tg.script.push((d, t) => {
      if (d.kind !== 'select' || !d.prompt.startsWith('Loucura')) return null;
      maoAoDecidir = t.state.zones.hand[0].length;
      return { kind: 'select', ids: ['no'] };
    });
    tg.attack([["Anje's Ravager", 1]]).passTo('declareBlockers');
    // a loucura só foi decidida depois de o gatilho do ataque terminar: as três cartas já tinham sido compradas
    expect(maoAoDecidir).toBe(3);
    expect(tg.find(OCC, 'graveyard', 0)).not.toBeNull();
  });

  it('CR 702.35a: sem mana para o custo de loucura, a carta vai para o cemitério', () => {
    const tg = setup({ battlefield: [[], []], hand: [[OCC], []] });
    tg.yes('Loucura', false);
    tg.run(discard(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.find(OCC, 'graveyard', 0)).not.toBeNull();
    expect(tg.state.zones.exile).toHaveLength(0);
  });
});
