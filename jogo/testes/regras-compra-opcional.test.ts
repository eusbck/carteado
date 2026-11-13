// lote3-c: substituição de compra opcional (CR 614.1a, 614.5, 121.6). O gancho drawReplace pode devolver false quando
// o jogador recusa ("você pode, em vez disso…"); a compra então acontece normalmente, sem a substituição ser oferecida de
// novo para a mesma compra.
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { draw } from '../motor/api.ts';
import { runEffect } from './artefatos.ts';

describe('Substituição de compra opcional', () => {
  it('CR 614.1a: aceita, a compra é substituída (nenhuma carta comprada)', () => {
    const tg = setup({ battlefield: [['Pavel Chekov, First Posting'], []], library: [['Sol Ring', 'Forest'], []] });
    tg.yes('Pavel Chekov', true).choose('Pavel Chekov: escolha', ['Terreno']);
    runEffect(tg, draw(tg.g, 0, 1));
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    expect(tg.state.turnStats[0].cardsDrawn).toBe(0);
  });
  it('CR 614.5: recusada, a compra acontece uma vez só, sem perguntar de novo', () => {
    const tg = setup({ battlefield: [['Pavel Chekov, First Posting'], []], library: [['Sol Ring', 'Forest', 'Island'], []] });
    let perguntas = 0;
    for (let i = 0; i < 3; i++) tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Pavel Chekov') && d.items.some((x) => x.id === 'no')) { perguntas++; return { kind: 'select', ids: ['no'] }; } return null; });
    runEffect(tg, draw(tg.g, 0, 1));
    expect(perguntas).toBe(1);
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
  });
  it('CR 121.6: em compras seguidas, cada uma é substituída ou não à parte', () => {
    const tg = setup({ battlefield: [['Pavel Chekov, First Posting'], []], library: [['Sol Ring', 'Forest', 'Island'], []] });
    tg.yes('Pavel Chekov', false);
    tg.yes('Pavel Chekov', true).choose('Pavel Chekov: escolha', ['Terreno']);
    runEffect(tg, draw(tg.g, 0, 2));
    expect(tg.names(0, 'hand').sort()).toEqual(['Forest', 'Sol Ring']);
  });
});
