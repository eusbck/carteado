import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Gene Pollinator';

describe(N, () => {
  it('pode virar qualquer permanente sua, inclusive criatura com enjoo, mas a própria precisa estar pronta', () => {
    for (const outra of ['Forest', 'Sol Ring', 'Obsessive Pursuit', 'Silver Myr']) {
      const tg = setup({ battlefield: [[N, { name: outra, ready: false }], []] });
      tg.choose('permanente desvirada', [outra]);
      activateMana(tg, N, 'R');
      expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['R']);
      expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
      expect(tg.state.objects[tg.bf(outra)].tapped).toBe(true);
      expect(tg.state.zones.stack).toHaveLength(0);
    }
    const enjoada = setup({ battlefield: [[{ name: N, ready: false }, 'Forest'], []] });
    expect(manaOptions(enjoada.g, 0).some((o) => o.obj === enjoada.bf(N))).toBe(false);
  });
  it('produz uma mana de cada uma das cinco cores', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []] });
    expect(manaOptions(tg.g, 0).filter((o) => o.obj === tg.bf(N)).map((o) => o.alt.join('')).sort()).toEqual(['B', 'G', 'R', 'U', 'W']);
  });
  it('não pode pagar os dois custos virando só a própria Gene Pollinator', () => {
    const tg = setup({ battlefield: [[N], ['Forest']] });
    expect(manaOptions(tg.g, 0).some((o) => o.obj === tg.bf(N))).toBe(false);
  });
  it('permanente virada ou controlada pelo oponente não paga o segundo custo', () => {
    const tg = setup({ battlefield: [[N, { name: 'Forest', tapped: true }], ['Sol Ring']] });
    expect(manaOptions(tg.g, 0).some((o) => o.obj === tg.bf(N))).toBe(false);
  });
  it('o pagamento automático não pode contar duas vezes o terreno usado no segundo custo', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []], hand: [['Biotech Specialist'], []] });
    expect(tg.canCast('Biotech Specialist')).toBe(false);
  });
  it('paga automaticamente duas cores com um terreno e outra permanente livre', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Obsessive Pursuit'], []], hand: [['Biotech Specialist'], []] });
    tg.cast('Biotech Specialist').resolveAll();
    expect(tg.find('Biotech Specialist')).not.toBeNull();
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Obsessive Pursuit')].tapped).toBe(true);
  });
});
