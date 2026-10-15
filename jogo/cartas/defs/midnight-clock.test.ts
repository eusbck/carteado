import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { returnToHand } from '../../motor/actions.ts';

const N = 'Midnight Clock';
const cartas = (n: number) => Array(n).fill('Plains');
const horas = (tg: ReturnType<typeof setup>) => tg.state.objects[tg.bf(N)].counters.hour ?? 0;

describe(N, () => {
  it('ganha um marcador na manutenção de cada jogador', () => {
    const tg = setup({ step: 'end', battlefield: [[N], []], library: [cartas(3), cartas(3)] });
    tg.passTo('draw', 1);
    expect(horas(tg)).toBe(1);
    tg.passTo('draw', 0);
    expect(horas(tg)).toBe(2);
  });

  it('a mana do próprio relógio ajuda a pagar {2}{U}', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []] });
    tg.activate(N, 'marcador de hora').resolve();
    expect(horas(tg)).toBe(1);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });

  it('no décimo segundo marcador, embaralha mão e cemitério no grimório, compra sete e é exilado', () => {
    const tg = setup({
      battlefield: [[{ name: N, counters: { hour: 11 } }, 'Island', 'Island', 'Island'], []],
      hand: [['Opt', 'Forest'], []], graveyard: [['Serum Visions', 'Swamp'], []], library: [cartas(5), []],
    });
    tg.activate(N, 'marcador de hora').resolve();
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolve();
    expect(tg.names(0, 'hand')).toHaveLength(7);
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.state.zones.library[0]).toHaveLength(2);
    expect(tg.names(0, 'exile')).toEqual([N]);
  });

  it('se o artefato já saiu do campo quando o gatilho resolve, ele não é exilado', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { hour: 11 } }, 'Island', 'Island', 'Island'], []], library: [cartas(8), []] });
    tg.activate(N, 'marcador de hora').resolve();
    tg.run(returnToHand(tg.g, [tg.bf(N)]));
    tg.resolve();
    expect(tg.find(N, 'exile')).toBeNull();
    expect(tg.names(0, 'hand')).toHaveLength(7);
  });
});
