// lote3-d (motor/controle.ts, motor/controle-base.ts): manutenção cumulativa, segundo dividido, energia, trocar o
// controle, manifestar o pavor, resistência a magia contra habilidades e "resolve mesmo com o alvo ilegal".
import { describe, expect, it } from 'vitest';
import {
  addEffect, controllerOf, custoVezes, energyOf, exchangeControl, getEnergy, manifestDread, payEnergy, splitSecondActive,
  SPLIT_SECOND,
} from '../motor/api.ts';
import { runEffect } from './artefatos.ts';
import { setup } from './harness.ts';

describe('Manutenção cumulativa (CR 702.24)', () => {
  it('CR 702.24a: o custo é pago uma vez por marcador de idade', () => {
    expect(custoVezes('{1}', 3)).toBe('{3}');
    expect(custoVezes('{U}', 2)).toBe('{U}{U}');
    expect(custoVezes('{1}{G}', 2)).toBe('{2}{G}{G}');
    expect(custoVezes('{1}', 0)).toBe('');
  });
  it('CR 702.24a: na manutenção põe um marcador de idade e, sem pagamento, sacrifica', () => {
    const tg = setup({ active: 1, battlefield: [['Mystic Remora', 'Island'], []], library: [['Opt', 'Opt'], ['Forest', 'Forest']] });
    tg.yes('manutenção cumulativa', true);
    tg.passTo('draw', 0);
    expect(tg.state.objects[tg.bf('Mystic Remora')].counters.age).toBe(1);
    tg.yes('manutenção cumulativa', false);
    tg.passTo('upkeep', 1).passTo('draw', 0);
    expect(tg.find('Mystic Remora')).toBeNull();
  });
});

describe('Segundo dividido (CR 702.61)', () => {
  it('CR 702.61a: com a mágica na pilha, ninguém conjura nem ativa habilidade que não seja de mana', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Grim Monolith'], ['Island', 'Island']], hand: [['Opt', 'Ponder'], ['Counterspell']], library: [['Forest', 'Forest'], []] });
    tg.cast('Opt');
    const opt = tg.find('Opt', 'stack')!;
    addEffect(tg.g, { source: opt, sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [opt], mods: [{ k: 'addKeyword', kw: SPLIT_SECOND }] });
    tg.refresh();
    expect(splitSecondActive(tg.g)).toBe(true);
    // nem o próprio controlador: Ponder e o {4} do Grim Monolith somem; a mana continua
    const acoes = tg.actionIds();
    expect(acoes.some((a) => a.startsWith('cast:') || a.startsWith('act:'))).toBe(false);
    expect(acoes.some((a) => a.startsWith('mana:'))).toBe(true);
    tg.pass();
    expect(tg.actionIds().some((a) => a.startsWith('cast:'))).toBe(false);
    tg.pass();
    expect(splitSecondActive(tg.g)).toBe(false);
    expect(tg.canCast('Ponder')).toBe(true);
  });
});

describe('Energia (CR 107.14)', () => {
  it('CR 107.14: receber e pagar energia; não dá para pagar mais do que se tem', () => {
    const tg = setup({ battlefield: [[], []] });
    getEnergy(tg.g, 0, 4);
    expect(energyOf(tg.g, 0)).toBe(4);
    expect(payEnergy(tg.g, 0, 5)).toBe(false);
    expect(energyOf(tg.g, 0)).toBe(4);
    expect(payEnergy(tg.g, 0, 3)).toBe(true);
    expect(energyOf(tg.g, 0)).toBe(1);
  });
  it('CR 107.14: a energia não some ao trocar de etapa ou de turno', () => {
    const tg = setup({ battlefield: [[], []], library: [['Opt'], ['Forest']] });
    getEnergy(tg.g, 0, 2);
    tg.refresh().passTo('upkeep', 1);
    expect(energyOf(tg.g, 0)).toBe(2);
  });
});

describe('Trocar o controle (CR 701.12)', () => {
  it('CR 701.12b: cada um ganha o controle do permanente do outro', () => {
    const tg = setup({ battlefield: [['Sol Ring'], ['Mind Stone']] });
    expect(exchangeControl(tg.g, tg.bf('Sol Ring'), tg.bf('Mind Stone'), tg.bf('Sol Ring'))).toBe(true);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(1);
    expect(controllerOf(tg.g, tg.bf('Mind Stone'))).toBe(0);
  });
  it('CR 701.12b: com o mesmo controlador, a troca não faz nada', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Mind Stone'], []] });
    expect(exchangeControl(tg.g, tg.bf('Sol Ring'), tg.bf('Mind Stone'), tg.bf('Sol Ring'))).toBe(false);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(0);
  });
  it('CR 701.12a: se um dos dois saiu do campo, nada é trocado', () => {
    const tg = setup({ battlefield: [['Sol Ring'], []], hand: [[], ['Mind Stone']] });
    const naMao = tg.find('Mind Stone', 'hand', 1)!;
    expect(exchangeControl(tg.g, tg.bf('Sol Ring'), naMao, tg.bf('Sol Ring'))).toBe(false);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(0);
  });
});

describe('Manifestar o pavor (CR 701.62)', () => {
  it('CR 701.62a: uma das duas do topo entra virada para baixo como 2/2; a outra vai para o cemitério', () => {
    const tg = setup({ battlefield: [[], []], library: [['Opt', 'Spellseeker', 'Forest'], []] });
    tg.choose('Manifestar o pavor', ['Spellseeker']);
    const id = runEffect(tg, manifestDread(tg.g, 0))!;
    expect(tg.state.objects[id].faceDown).toBe(true);
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(tg.names(0, 'graveyard')).toEqual(['Opt']);
    expect(tg.names(0, 'library')).toEqual(['Forest']);
  });
  it('CR 701.62a: com uma carta só, ela é manifestada; sem cartas, nada acontece', () => {
    const tg = setup({ battlefield: [[], []], library: [['Opt'], []] });
    const id = runEffect(tg, manifestDread(tg.g, 0));
    expect(id).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(runEffect(tg, manifestDread(tg.g, 0))).toBeNull();
  });
});

describe('Resistência a magia contra habilidades (CR 702.11d)', () => {
  it('CR 702.11d: habilidade de oponente não mira; mágica de oponente e habilidade sua miram', () => {
    // Volatile Stormdrake do Bruno; a habilidade do Gilded Drake da Ana não o vê, o Twitch da Ana vê
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Island'], ['Volatile Stormdrake']], hand: [['Gilded Drake', 'Twitch'], []] });
    let alvos: string[] | null = null;
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('até uma criatura alvo')) { alvos = d.items.map((i) => i.label); return { kind: 'select', ids: [] }; } return null; });
    tg.cast('Gilded Drake').resolveAll();
    // sem alvo possível, a pergunta nem aparece; o Drake é sacrificado
    expect(alvos ?? []).toEqual([]);
    let alvosTwitch: string[] = [];
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('artefato, criatura ou terreno alvo')) { alvosTwitch = d.items.map((i) => i.label); return { kind: 'select', ids: [d.items[0].id] }; } return null; });
    tg.cast('Twitch');
    expect(alvosTwitch).toContain('Volatile Stormdrake');
  });
});

describe('"Esta habilidade resolve mesmo que o alvo fique ilegal" (Gilded Drake)', () => {
  it('CR 608.2b: com a exceção escrita na carta, a habilidade resolve com o alvo ilegal', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Spellseeker']], hand: [['Gilded Drake'], []] });
    tg.choose('até uma criatura alvo', ['Spellseeker']).cast('Gilded Drake').resolve();
    const alvo = tg.bf('Spellseeker');
    addEffect(tg.g, { source: alvo, sourceDef: '', controller: 1, duration: { kind: 'endOfTurn' }, affected: [alvo], mods: [{ k: 'addKeyword', kw: 'shroud' }] });
    tg.refresh().resolveAll();
    // resolveu: o Drake foi sacrificado por não haver troca
    expect(tg.find('Gilded Drake')).toBeNull();
  });
});
