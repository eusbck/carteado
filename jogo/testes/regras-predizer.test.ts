// Predizer / foretell (CR 702.143, 116.2h): ação especial no seu turno; a carta predita se conjura num turno posterior.
import { describe, expect, it } from 'vitest';
import { fixture as setup } from './artefatos.ts';

const SAGE = 'Sage of the Beyond';
const ilhas = (n: number) => Array(n).fill('Island');
const predizer = (tg: ReturnType<typeof setup>) => tg.actionIds().find((a) => a.startsWith('foretell:'));

describe('Predizer (CR 702.143)', () => {
  it('CR 116.2h: só durante o seu turno, com prioridade, e também com a pilha ocupada', () => {
    const tg = setup({ battlefield: [[...ilhas(4), 'Swamp', 'Swamp'], ilhas(2)], hand: [[SAGE, 'Baleful Strix'], [SAGE]] });
    expect(predizer(tg)).toBeDefined();
    // com uma mágica na pilha, ainda dá (ação especial não precisa de pilha vazia)
    tg.cast('Baleful Strix');
    expect(tg.state.zones.stack).toHaveLength(1);
    expect(predizer(tg)).toBeDefined();
    tg.resolveAll();
    // no turno de Bruno, ele pode predizer a carta dele; Ana, com prioridade, não pode predizer a dela
    tg.passTo('main1', 1);
    expect(tg.pending?.player).toBe(1);
    expect(predizer(tg)).toBeDefined();
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(predizer(tg)).toBeUndefined();
  });

  it('CR 702.143a: paga {2}, exila virada para baixo, só o dono olha, e não se conjura no mesmo turno', () => {
    const tg = setup({ battlefield: [ilhas(2), []], hand: [[SAGE], []] });
    tg.answer({ kind: 'priority', action: predizer(tg)! });
    tg.settle();
    const ex = tg.find(SAGE, 'exile')!;
    expect(tg.state.objects[ex].faceDown).toBe(true);
    expect(tg.state.objects[ex].visibleTo).toEqual([0]);
    expect(tg.state.objects[ex].data.foretold).toEqual({ turn: tg.state.turn.number });
    expect(tg.actionIds().some((a) => a.split(':').includes(String(ex)))).toBe(false);
  });

  it('CR 116.2h: sem {2} disponível, não há a ação', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [[SAGE], []] });
    expect(predizer(tg)).toBeUndefined();
  });
});
