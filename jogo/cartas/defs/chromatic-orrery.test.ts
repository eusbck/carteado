import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Chromatic Orrery', () => {
  it('{T}: adiciona {C}{C}{C}{C}{C}', () => expect(alternativasDeMana('Chromatic Orrery')).toEqual(['CCCCC']));

  it('CR 609.4b: a mana paga símbolos de qualquer cor, para você e não para o oponente', () => {
    // Indomitable Ancients ({2}{W}{W}) com quatro Islands
    const tg = setup({ battlefield: [[{ name: 'Chromatic Orrery', tapped: true }, 'Island', 'Island', 'Island', 'Island'], []], hand: [['Indomitable Ancients'], []] });
    expect(tg.canCast('Indomitable Ancients')).toBe(true);
    tg.cast('Indomitable Ancients').resolve();
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).not.toBeNull();
    const sem = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], ['Chromatic Orrery']], hand: [['Indomitable Ancients'], []] });
    expect(sem.canCast('Indomitable Ancients')).toBe(false);
  });

  it('compra uma carta por cor entre os seus permanentes', () => {
    const tg = setup({
      battlefield: [['Chromatic Orrery', 'Killian, Ink Duelist', 'Elvish Mystic', 'Sol Ring', 'Sol Ring', 'Mountain'], ['Rootha, Mastering the Moment']],
      library: [['Island', 'Plains', 'Swamp', 'Forest'], []],
    });
    tg.activate('Chromatic Orrery', 'Compre').resolve();
    // branco, preto (Killian) e verde (Elvish Mystic): 3; o Rootha do oponente não conta
    expect(tg.names(0, 'hand').length).toBe(3);
  });
});
