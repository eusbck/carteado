import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Danitha, New Benalia's Light";

describe(N, () => {
  it('conjura um Equipamento do cemitério pagando o custo, só uma vez por turno e só no seu turno', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Plains'], []], graveyard: [['Swiftfoot Boots', 'Lightning Greaves', 'Wall of Omens'], []] });
    expect(tg.canCast('Swiftfoot Boots')).toBe(true);
    expect(tg.canCast('Wall of Omens')).toBe(false);
    tg.cast('Swiftfoot Boots', '*').resolveAll();
    expect(tg.find('Swiftfoot Boots', 'battlefield', 0)).not.toBeNull();
    expect(tg.state.objects[tg.bf('Plains')].tapped || tg.all('Plains').some((p) => tg.state.objects[p].tapped)).toBe(true);
    // a segunda no mesmo turno não
    expect(tg.canCast('Lightning Greaves')).toBe(false);
    // no turno do oponente, não
    tg.passTo('main1', 1);
    expect(tg.canCast('Lightning Greaves')).toBe(false);
    tg.passTo('main1', 0);
    expect(tg.canCast('Lightning Greaves')).toBe(true);
  });
});
