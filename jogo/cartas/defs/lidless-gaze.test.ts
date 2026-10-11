import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Lidless Gaze';

describe(N, () => {
  it('exila o topo do grimório de cada jogador; você pode jogá-los com mana de qualquer tipo até o fim do seu próximo turno', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Mountain', 'Mountain', 'Mountain'], []], hand: [[N], []],
      library: [['Sol Ring', ...Array(6).fill('Swamp')], ['Elvish Mystic', ...Array(6).fill('Island')]],
    });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring']);
    expect(tg.names(1, 'exile')).toEqual(['Elvish Mystic']);
    // Elvish Mystic ({G}) do oponente, pago com a Mountain que sobrou
    tg.cast('Elvish Mystic', '*').resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].controller).toBe(0);
    // no seu próximo turno o Sol Ring ainda pode ser conjurado; depois, não
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.canCast('Sol Ring')).toBe(true);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.canCast('Sol Ring')).toBe(false);
  });

  it('retrospectiva {2}{B}{R}: conjurada do cemitério e exilada', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Mountain', 'Mountain'], []], graveyard: [[N], []], library: [['Sol Ring'], ['Island']] });
    tg.cast(N, 'flashback').resolveAll();
    expect(tg.names(0, 'exile').sort()).toEqual([N, 'Sol Ring'].sort());
  });
});
