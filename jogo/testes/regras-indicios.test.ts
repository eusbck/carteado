// Reunir indícios: CR 701.59a-c; custos de conjuração, CR 601.2h.
import { describe, expect, it } from 'vitest';
import { canCollectEvidence, collectEvidence, collectEvidenceCost } from '../motor/api.ts';
import type { LiveDecision } from '../motor/ask.ts';
import { canPayParts } from '../motor/costs.ts';
import { runEffect } from './artefatos.ts';
import { setup } from './harness.ts';

describe('Reunir indícios (CR 701.59)', () => {
  it('CR 701.59a: soma os valores de mana de qualquer quantidade de cartas e exila juntas, inclusive terrenos', () => {
    const tg = setup({ graveyard: [['Wall of Omens', 'Indomitable Ancients', 'Forest'], []] });
    tg.choose('Reunir indícios', ['Wall of Omens (valor de mana 2)', 'Indomitable Ancients (valor de mana 4)', 'Forest (valor de mana 0)']);
    const exiladas = runEffect(tg, collectEvidence(tg.g, 0, 6));
    expect(exiladas).toHaveLength(3);
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.names(0, 'exile')).toEqual(['Wall of Omens', 'Indomitable Ancients', 'Forest']);
  });
  it('CR 701.59a: pode ultrapassar o total pedido', () => {
    const tg = setup({ graveyard: [['Zetalpa, Primal Dawn', 'Sol Ring'], []] });
    tg.choose('Reunir indícios', ['Zetalpa, Primal Dawn (valor de mana 8)']);
    runEffect(tg, collectEvidence(tg.g, 0, 6));
    expect(tg.names(0, 'exile')).toEqual(['Zetalpa, Primal Dawn']);
    expect(tg.names(0, 'graveyard')).toEqual(['Sol Ring']);
  });
  it('CR 701.59b: não permite usar o cemitério do oponente nem um total próprio insuficiente', () => {
    const tg = setup({ hand: [['Deadly Cover-Up'], []], graveyard: [['Indomitable Ancients', 'Sol Ring'], ['Zetalpa, Primal Dawn']] });
    expect(canCollectEvidence(tg.g, 0, 6)).toBe(false);
    expect(canPayParts(tg.g, 0, collectEvidenceCost(6).parts, tg.find('Deadly Cover-Up', 'hand')!)).toBe(false);
    expect(runEffect(tg, collectEvidence(tg.g, 0, 6))).toBe(false);
    expect(tg.names(0, 'graveyard')).toEqual(['Indomitable Ancients', 'Sol Ring']);
    expect(tg.names(1, 'exile')).toEqual([]);
  });
  it('CR 701.59a: uma seleção parcial abaixo de N é recusada antes de exilar qualquer carta', () => {
    const tg = setup({ graveyard: [['Wall of Omens', 'Indomitable Ancients'], []] });
    const gen = collectEvidence(tg.g, 0, 6);
    const d = gen.next().value as LiveDecision;
    const parede = d.kind === 'select' ? d.items.find((i) => i.label.startsWith('Wall'))!.id : '';
    expect(d.validate?.({ kind: 'select', ids: [parede] })).toContain('6 ou maior');
    expect(tg.names(0, 'exile')).toEqual([]);
    gen.return(false);
  });
  it('CR 701.59a: reunir indícios zero pode exilar zero cartas', () => {
    const tg = setup();
    expect(canCollectEvidence(tg.g, 0, 0)).toBe(true);
    expect(runEffect(tg, collectEvidence(tg.g, 0, 0))).toEqual([]);
  });
});
