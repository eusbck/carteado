// lote3-f: evocar (CR 702.74a), dash (CR 702.109a), barganha (CR 702.166) e devoção (CR 700.5), em motor/cedh.ts
import { describe, expect, it } from 'vitest';
import { devotion } from '../motor/api.ts';
import { setup } from './harness.ts';

describe('evocar, dash, barganha e devoção', () => {
  it('CR 702.74a: conjurada pelo custo de evocar, é sacrificada quando entra', () => {
    const tg = setup({ hand: [['Grief', 'Dark Ritual'], ['Island']] });
    tg.choose('Exile 1 carta preta', ['Dark Ritual']).cast('Grief', 'evoke').resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Grief']);
  });

  it('CR 702.74a: conjurada normalmente, fica no campo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Grief'], ['Island']] });
    tg.cast('Grief').resolveAll();
    expect(tg.find('Grief')).not.toBeNull();
  });

  it('CR 702.109a: com o custo de dash pago, tem ímpeto e volta para a mão no início da próxima etapa final', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], []], hand: [['Ragavan, Nimble Pilferer'], []], library: [['Island'], ['Island']] });
    tg.cast('Ragavan, Nimble Pilferer', 'dash').resolve();
    const id = tg.bf('Ragavan, Nimble Pilferer');
    expect(tg.g.state.objects[id]).toBeDefined();
    expect(tg.actionIds().length).toBeGreaterThan(0);
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Ragavan, Nimble Pilferer']);
  });

  it('CR 702.166b: barganha é custo adicional opcional de sacrificar um artefato, encantamento ou ficha', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Sol Ring'], []], hand: [['Beseech the Mirror'], []], library: [['Island', 'Dark Ritual'], []] });
    tg.choose('custo adicional opcional', ['Pagar: barganha (sacrifique um artefato, encantamento ou ficha)']).choose('Sacrifique', ['Sol Ring']);
    tg.choose('Procure', ['Dark Ritual']).yes('conjurar Dark Ritual', true);
    tg.cast('Beseech the Mirror').resolveAll();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Beseech the Mirror', 'Dark Ritual', 'Sol Ring'].sort());
  });

  it('CR 700.5: devoção conta os símbolos da cor nos custos de mana dos permanentes; híbridos contam uma vez', () => {
    const tg = setup({ battlefield: [["Thassa's Oracle", 'Sol Ring', 'Island', 'Inalla, Archmage Ritualist'], ['Spellseeker']] });
    expect(devotion(tg.g, 0, ['U'])).toBe(3);
    expect(devotion(tg.g, 0, ['U', 'B'])).toBe(4);
    expect(devotion(tg.g, 1, ['U'])).toBe(1);
  });
});
