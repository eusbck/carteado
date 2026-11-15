import { describe, expect, it } from 'vitest';
import { planPayment } from '../motor/costs.ts';
import { parseCost } from '../motor/api.ts';
import { fixture as setup } from './artefatos.ts';

describe('Planejamento de mana com permanentes que pagam outros custos', () => {
  it('CR 118.3, 601.2h: o mesmo terreno não pode gerar mana e ser virado novamente para outro custo', () => {
    const tg = setup({ battlefield: [['Gene Pollinator', 'Forest'], []] });
    expect(planPayment(tg.g, 0, parseCost('{R}{G}'), { purpose: { kind: 'effect' } })).toBeNull();
    expect(planPayment(tg.g, 0, parseCost('{R}'), { purpose: { kind: 'effect' } })).not.toBeNull();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(false);
  });
  it('CR 601.2g-h: reserva uma permanente livre e preserva a fonte que precisa gerar a outra cor', () => {
    const tg = setup({ battlefield: [['Gene Pollinator', 'Obsessive Pursuit', 'Forest'], []], hand: [['Biotech Specialist'], []] });
    tg.cast('Biotech Specialist').resolveAll();
    expect(tg.find('Biotech Specialist')).not.toBeNull();
    expect(tg.state.players[0].manaPool).toHaveLength(0);
    for (const n of ['Gene Pollinator', 'Forest', 'Obsessive Pursuit']) expect(tg.state.objects[tg.bf(n)].tapped).toBe(true);
  });
  it('CR 118.3: duas habilidades não podem reservar uma única permanente para pagar os dois custos', () => {
    const tg = setup({ battlefield: [['Gene Pollinator', 'Gene Pollinator', 'Obsessive Pursuit'], []] });
    expect(planPayment(tg.g, 0, parseCost('{R}{B}'), { purpose: { kind: 'effect' } })).toBeNull();
    const suficiente = setup({ battlefield: [['Gene Pollinator', 'Gene Pollinator', 'Obsessive Pursuit', 'The Misty Mountains Cold'], []] });
    expect(planPayment(suficiente.g, 0, parseCost('{R}{B}'), { purpose: { kind: 'effect' } })).not.toBeNull();
  });
});
