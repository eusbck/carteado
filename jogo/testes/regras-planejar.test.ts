// Planejar / plot (CR 702.170, 116.2k): ação especial na sua fase principal com a pilha vazia; a carta planejada se
// conjura num turno posterior, sem pagar o custo de mana, na sua fase principal com a pilha vazia (motor/planejar.ts).
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';

const LL = 'Lock and Load';
const cartas = (n: number) => Array(n).fill('Plains');
const planejar = (tg: ReturnType<typeof setup>) => tg.actionIds().find((a) => a.startsWith('plot:'));
const conjuraPlanejada = (tg: ReturnType<typeof setup>) => tg.actionIds().some((a) => a.startsWith('cast:') && a.endsWith(':plot'));

describe('Planejar (CR 702.170)', () => {
  it('CR 702.170a: só na sua fase principal, com a pilha vazia, e pagando o custo de planejar', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Island'], ['Island']], hand: [[LL, 'Opt'], ['Opt']], library: [cartas(5), cartas(5)] });
    expect(planejar(tg)).toBeDefined();
    // com uma mágica na pilha, não
    tg.cast('Opt');
    expect(planejar(tg)).toBeUndefined();
    tg.resolveAll();
    // no combate, não
    tg.passTo('beginCombat');
    expect(planejar(tg)).toBeUndefined();
    // na segunda fase principal, sim
    tg.passTo('main2');
    expect(planejar(tg)).toBeDefined();
    // sem {3}{U} disponível, não
    tg.state.objects[tg.state.zones.battlefield[0]].tapped = true;
    tg.state.objects[tg.state.zones.battlefield[1]].tapped = true;
    tg.refresh();
    expect(planejar(tg)).toBeUndefined();
  });

  it('CR 702.170b: é ação especial: não usa a pilha e a carta vai da mão para o exílio, virada para cima', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [[LL], []] });
    tg.answer({ kind: 'priority', action: planejar(tg)! });
    tg.settle();
    expect(tg.state.zones.stack).toHaveLength(0);
    const ex = tg.find(LL, 'exile')!;
    expect(tg.state.objects[ex].faceDown).toBe(false);
    expect(tg.state.objects[ex].data.plotted).toEqual({ turn: tg.state.turn.number });
    expect(tg.state.zones.battlefield.every((id) => tg.state.objects[id].tapped)).toBe(true);
    // a ação não deu prioridade ao oponente: ela continua com quem planejou
    expect(tg.pending?.player).toBe(0);
  });

  it('CR 702.170d: conjura-se num turno posterior, sem pagar o custo de mana, só na fase principal do dono com a pilha vazia', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [[LL], []], library: [cartas(10), cartas(10)] });
    tg.answer({ kind: 'priority', action: planejar(tg)! });
    tg.settle();
    expect(conjuraPlanejada(tg)).toBe(false);
    tg.passTo('upkeep', 0);
    expect(conjuraPlanejada(tg)).toBe(false);
    tg.passTo('main1', 0);
    for (const id of tg.state.zones.battlefield) tg.state.objects[id].tapped = true;
    tg.refresh();
    expect(conjuraPlanejada(tg)).toBe(true);
    tg.cast(LL, 'plot');
    expect(tg.find(LL, 'stack')).not.toBeNull();
    // a carta foi conjurada: conta como mágica do turno
    expect(tg.state.turnStats[0].spellsCast).toBe(1);
  });
});
