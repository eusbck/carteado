// Milagre (CR 702.94): revelar a primeira carta comprada no turno e conjurá-la pelo custo de milagre enquanto o gatilho
// ligado resolve (motor/actions.ts revelaMilagre, motor/milagre.ts).
import { describe, expect, it } from 'vitest';
import { draw, moveObjects } from '../motor/api.ts';
import { runEffect } from './artefatos.ts';
import { setup } from './harness.ts';

const planicies = (n: number) => Array(n).fill('Plains');
const perguntas = (tg: ReturnType<typeof setup>, trecho: string) => {
  const vistas: string[] = [];
  tg.script.push((d) => { if (d.prompt.includes(trecho)) vistas.push(d.prompt); return null; });
  return vistas;
};

describe('Milagre (CR 702.94)', () => {
  it('CR 702.94a, 608.2g: comprada na etapa de compra, revelada e conjurada pelo custo de milagre, fora do tempo de feitiço', () => {
    const tg = setup({ step: 'upkeep', battlefield: [['Plains', 'Wall of Omens'], ['Indomitable Ancients']], library: [['Terminus', 'Island'], ['Forest']] });
    tg.yes('Milagre: revelar', true).yes('Milagre: conjurar', true);
    tg.passUntil((t) => t.find('Terminus', 'stack') !== null);
    expect(tg.state.turn.step).toBe('draw');
    tg.resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Terminus']);
  });

  it('CR 702.94a: revelar é opcional; sem revelar, nada dispara e a carta fica na mão', () => {
    const tg = setup({ step: 'upkeep', battlefield: [['Plains'], []], library: [['Terminus', 'Island'], ['Forest']] });
    tg.yes('Milagre: revelar', false);
    tg.passTo('main1');
    expect(tg.names(0, 'hand')).toContain('Terminus');
    expect(tg.state.objects[tg.find('Terminus', 'hand')!].visibleTo).not.toBe('all');
    expect(tg.state.zones.stack).toHaveLength(0);
  });

  it('CR 702.94a-b: revelada e não conjurada, fica na mão, deixa de estar revelada e não pode mais ser conjurada pelo milagre', () => {
    const tg = setup({ step: 'upkeep', battlefield: [['Plains'], []], library: [['Terminus', 'Island'], ['Forest']] });
    tg.yes('Milagre: revelar', true).yes('Milagre: conjurar', false);
    tg.passTo('main1');
    const id = tg.find('Terminus', 'hand')!;
    expect(id).not.toBeNull();
    expect(tg.state.objects[id].visibleTo).not.toBe('all');
    // com um Plains só, o custo normal {4}{W}{W} não dá
    expect(tg.canCast('Terminus')).toBe(false);
  });

  it('CR 121.2, 702.94a: de três cartas compradas de uma vez, só a primeira pode ser revelada; a segunda do turno não pergunta', () => {
    const tg = setup({ battlefield: [planicies(2), []], library: [['Island', 'Terminus', 'Entreat the Angels', 'Forest'], ['Forest']] });
    const vistas = perguntas(tg, 'Milagre');
    runEffect(tg, draw(tg.g, 0, 3));
    expect(vistas).toEqual([]);
    expect(tg.state.zones.stack).toHaveLength(0);
    // a primeira compra do turno já foi; comprar outra vez também não pergunta
    runEffect(tg, draw(tg.g, 0, 1));
    expect(vistas).toEqual([]);
  });

  it('CR 702.94a: a carta que sai da mão antes de o gatilho resolver não é conjurada', () => {
    const tg = setup({ active: 1, battlefield: [['Plains'], []], library: [['Terminus'], ['Forest']] });
    tg.yes('Milagre: revelar', true);
    const vistas = perguntas(tg, 'Milagre: conjurar');
    runEffect(tg, draw(tg.g, 0, 1));
    expect(tg.state.zones.stack).toHaveLength(1);
    // com o gatilho na pilha, a carta é descartada
    runEffect(tg, moveObjects(tg.g, [{ id: tg.find('Terminus', 'hand')!, to: 'graveyard' }], 'discard'));
    tg.resolve();
    expect(vistas).toEqual([]);
    expect(tg.names(0, 'graveyard')).toEqual(['Terminus']);
    expect(tg.state.zones.stack).toHaveLength(0);
  });

  it('CR 702.94a: a compra continua sendo compra: os gatilhos de comprar disparam junto com o de milagre', () => {
    const tg = setup({ active: 1, battlefield: [['Plains', 'Psychosis Crawler'], []], hand: [['Island'], []], library: [['Terminus'], ['Forest']] });
    tg.yes('Milagre: revelar', true).yes('Milagre: conjurar', false);
    runEffect(tg, draw(tg.g, 0, 1));
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolveAll();
    expect(tg.life(1)).toBe(39);
    expect(tg.names(0, 'hand')).toContain('Terminus');
  });
});
