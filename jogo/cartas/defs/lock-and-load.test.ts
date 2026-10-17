import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Lock and Load';
const cartas = (n: number) => Array(n).fill('Plains');

describe(N, () => {
  it('compra uma carta mais uma para cada outra instantânea ou feitiço conjurado no turno, inclusive a anulada', () => {
    const tg = setup({
      battlefield: [['Island', 'Island', 'Island', 'Island', 'Island', 'Plains', 'Plains'], ['Island', 'Island']],
      hand: [['Opt', 'Opt', 'Wall of Omens', N], ['Counterspell']], library: [cartas(10), []],
    });
    tg.cast('Opt').resolveAll();
    tg.cast('Opt');
    tg.pass();
    tg.choose('mágica alvo', ['Opt']).cast('Counterspell').resolveAll();
    // mágica de criatura não conta
    tg.cast('Wall of Omens').resolveAll();
    const antes = tg.names(0, 'hand').length;
    tg.cast(N).resolveAll();
    // 1 + 2 Opts (uma anulada)
    expect(tg.names(0, 'hand').length).toBe(antes - 1 + 3);
  });

  it('cópia conjurada pela Mizzix\'s Mastery conta como esta mágica, não como outra (CR 707.12)', () => {
    const tg = setup({
      battlefield: [['Island', 'Island', 'Island', 'Island', 'Mountain'], []],
      hand: [['Opt', "Mizzix's Mastery"], []], graveyard: [[N], []], library: [cartas(10), []],
    });
    tg.cast('Opt').resolveAll();
    const antes = tg.names(0, 'hand').length;
    tg.choose('carta de instantânea ou de feitiço alvo', [N]).choose('escolha uma mágica para conjurar', [N]).cast("Mizzix's Mastery").resolveAll();
    // outras: Opt e a Mastery; a cópia conjurada não conta a si mesma: 1 + 2
    expect(tg.state.turnStats[0].instantSorceryCast).toBe(3);
    expect(tg.names(0, 'hand').length).toBe(antes - 1 + 3);
  });

  it('cópia feita na pilha (Stella Lee) não foi conjurada: todas as conjuradas são outras', () => {
    const tg = setup({
      battlefield: [['Stella Lee, Wild Card', 'Island', 'Island', 'Island', 'Island', 'Island'], []],
      hand: [['Opt', 'Opt', N], []], library: [cartas(20), []],
    });
    tg.cast('Opt').resolveAll();
    tg.cast('Opt').resolveAll();
    tg.cast(N);
    tg.choose('mágica instantânea ou de feitiço alvo que você controla', [N]).activate('Stella Lee, Wild Card');
    tg.resolve();
    const antes = tg.names(0, 'hand').length;
    // a cópia: 1 + 3 (as duas Opts e o Lock and Load original)
    tg.resolve();
    expect(tg.names(0, 'hand').length).toBe(antes + 4);
    // o original: 1 + 2
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(antes + 4 + 3);
  });

  it('planejada, só pode ser conjurada num turno posterior, de graça, na fase principal com a pilha vazia', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [[N, 'Opt'], []], library: [cartas(10), cartas(10)] });
    const planejar = tg.actionIds().find((a) => a.startsWith('plot:'))!;
    expect(planejar).toBeDefined();
    tg.answer({ kind: 'priority', action: planejar });
    tg.settle();
    expect(tg.names(0, 'exile')).toEqual([N]);
    expect(tg.state.zones.stack).toHaveLength(0);
    const conjuraPlanejada = () => tg.actionIds().some((a) => a.startsWith('cast:') && a.endsWith(':plot'));
    // no mesmo turno, não
    expect(conjuraPlanejada()).toBe(false);
    // no turno do oponente, não
    tg.passTo('main1', 1);
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(conjuraPlanejada()).toBe(false);
    // no seu turno seguinte, na fase principal, sim, sem pagar: todas as Ilhas viradas e ainda dá
    tg.passTo('main1', 0);
    for (const id of tg.state.zones.battlefield) tg.state.objects[id].tapped = true;
    tg.refresh();
    expect(conjuraPlanejada()).toBe(true);
    const mao = tg.names(0, 'hand').length;
    tg.cast(N, 'plot').resolveAll();
    expect(tg.names(0, 'hand').length).toBe(mao + 1);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});
