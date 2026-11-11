// lote3-f: habilidade ativada que anota a mana gasta no custo (CR 602.2h), em motor/stack.ts (ActivatedDef.onManaPaid)
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';

describe('mana gasta numa ativação', () => {
  it('CR 602.2h: o tipo de mana gasto fica anotado ao pagar, antes de a habilidade resolver', () => {
    const tg = setup({ battlefield: [['Jeweled Amulet', 'Island'], []] });
    tg.activate('Jeweled Amulet');
    expect(tg.state.objects[tg.bf('Jeweled Amulet')].data.tipoAnotado).toBe('U');
  });
});
