import { describe, expect, it } from 'vitest';
import { controllerOf } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Thieving Skydiver';
const B = "Dream-Thief's Bandana";

describe(N, () => {
  it('reforçada com X = 2, custa {1}{U} + {2} e o valor de mana continua 2', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Island'], ['Sol Ring', 'Thieving Amalgam']], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Pagar: kicker {X}']).number('valor de X', 2);
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('artefato alvo')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast(N);
    const magica = tg.state.zones.stack[0];
    expect(tg.state.objects[magica].stack?.x).toBe(2);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped)).toHaveLength(4);
    tg.resolveAll();
    expect(opcoes).toEqual(['Sol Ring']);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(0);
  });

  it('ganha o controle de um artefato com valor de mana até X, e o controle não acaba', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], ['Prismatic Lens']], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Pagar: kicker {X}']).number('valor de X', 2).choose('artefato alvo', ['Prismatic Lens']);
    tg.cast(N).resolveAll();
    tg.passTo('main1', 1).passTo('main1', 0);
    expect(controllerOf(tg.g, tg.bf('Prismatic Lens'))).toBe(0);
  });

  it('pode mirar um artefato seu; se for Equipamento, é anexado a ela', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Slither Blade', { name: B, attachTo: 'Slither Blade' }], []], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Pagar: kicker {X}']).number('valor de X', 2).choose('artefato alvo', [B]);
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf(B)].attachedTo).toBe(tg.bf(N));
  });

  it('posta no campo sem ser conjurada, não foi reforçada e não rouba nada', () => {
    const tg = setup({ battlefield: [[], ['Sol Ring']] });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(1);
  });

  it('sem kicker, não escolhe X nem dispara', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], ['Sol Ring']], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Não pagar']);
    tg.cast(N).resolveAll();
    expect(tg.find(N)).not.toBeNull();
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(1);
  });
});
