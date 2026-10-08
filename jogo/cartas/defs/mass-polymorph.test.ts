import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const ilhas = ['Island', 'Island', 'Island', 'Island', 'Island', 'Island'];

describe('Mass Polymorph', () => {
  it('exila as suas criaturas (fichas também contam) e revela até achar o mesmo número de cartas de criatura', () => {
    const tg = setup({
      battlefield: [[...ilhas, 'Elvish Mystic', { name: 'Soldier', token: true }], ['Wall of Omens']],
      hand: [['Mass Polymorph'], []],
      library: [['Plains', 'Indomitable Ancients', 'Sol Ring', 'Crashing Drawbridge', 'Forest', 'Zetalpa, Primal Dawn'], []],
    });
    tg.cast('Mass Polymorph').resolve();
    expect(tg.names(0, 'exile')).toEqual(['Elvish Mystic']); // a ficha deixou de existir no exílio
    expect(tg.find('Soldier')).toBeNull();
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).not.toBeNull();
    expect(tg.find('Crashing Drawbridge', 'battlefield', 0)).not.toBeNull();
    // a criatura do oponente não é afetada; a terceira criatura do grimório não foi revelada
    expect(tg.find('Wall of Omens', 'battlefield', 1)).not.toBeNull();
    expect(tg.names(0, 'library').sort()).toEqual(['Forest', 'Plains', 'Sol Ring', 'Zetalpa, Primal Dawn']);
  });

  it('com menos cartas de criatura no grimório do que criaturas exiladas, revela o grimório todo', () => {
    const tg = setup({
      battlefield: [[...ilhas, 'Elvish Mystic', 'Indomitable Ancients', 'Crashing Drawbridge'], []],
      hand: [['Mass Polymorph'], []],
      library: [['Plains', 'Zetalpa, Primal Dawn', 'Forest'], []],
    });
    tg.cast('Mass Polymorph').resolve();
    expect(tg.names(0, 'exile').sort()).toEqual(['Crashing Drawbridge', 'Elvish Mystic', 'Indomitable Ancients']);
    expect(tg.names(0, 'battlefield').filter((n) => n !== 'Island')).toEqual(['Zetalpa, Primal Dawn']);
    expect(tg.names(0, 'library').sort()).toEqual(['Forest', 'Plains']);
    expect(tg.state.log.some((l) => l.text.includes('Ana revela Plains, Zetalpa, Primal Dawn, Forest'))).toBe(true);
  });

  it('as criaturas entram juntas e os gatilhos de entrar vão para a pilha depois da resolução', () => {
    const tg = setup({
      battlefield: [[...ilhas, 'Elvish Mystic', 'Indomitable Ancients'], []],
      hand: [['Mass Polymorph'], []],
      library: [['Wall of Omens', 'Wall of Omens', 'Island', 'Swamp'], []],
    });
    tg.cast('Mass Polymorph').resolve();
    expect(tg.all('Wall of Omens').length).toBe(2);
    expect(tg.names(0, 'graveyard')).toEqual(['Mass Polymorph']);
    // os dois "quando entra, compre uma carta" esperam a mágica terminar e só então vão para a pilha
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(2);
  });

  it('sem criaturas, não revela nada', () => {
    const tg = setup({ battlefield: [ilhas, []], hand: [['Mass Polymorph'], []], library: [['Indomitable Ancients', 'Island'], []] });
    tg.cast('Mass Polymorph').resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.names(0, 'library').sort()).toEqual(['Indomitable Ancients', 'Island']);
  });
});
