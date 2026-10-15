import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const CELLAR = 'Ancient Cellarspawn';

describe(CELLAR, () => {
  it('o Demon custa {1} a menos; com 3 de mana gasta e valor de mana 4, o oponente alvo perde 1', () => {
    const tg = setup({ battlefield: [[CELLAR, 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Nightmare Shepherd'], []] });
    tg.cast('Nightmare Shepherd');
    expect(tg.all('Swamp').every((id) => tg.state.objects[id].tapped)).toBe(true);
    tg.resolve();
    expect(tg.life(1)).toBe(39);
    tg.resolve();
    expect(tg.find('Nightmare Shepherd')).not.toBeNull();
  });

  it('pagando o custo inteiro, não dispara; de graça, perde o valor de mana inteiro', () => {
    const tg = setup({ battlefield: [[CELLAR, 'One with the Multiverse', 'Plains', 'Plains', 'Plains'], []], hand: [['Ghostly Prison', 'Auramancer'], []], graveyard: [[], []] });
    tg.cast('Auramancer');
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolveAll();
    const gratis = tg.actionIds().find((a) => a.includes('owtm-gratis') && a.split(':')[1] === String(tg.find('Ghostly Prison', 'hand', 0)));
    tg.answer({ kind: 'priority', action: gratis! });
    tg.settle();
    tg.resolve();
    expect(tg.life(1)).toBe(37);
  });
});
