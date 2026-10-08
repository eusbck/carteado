import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const ilhas = ['Island', 'Island', 'Island', 'Island', 'Island', 'Island'];

describe('Synthetic Destiny', () => {
  it('na etapa final, revela até o mesmo número de cartas de criatura e elas entram juntas', () => {
    const tg = setup({
      battlefield: [[...ilhas, 'Elvish Mystic', 'Indomitable Ancients'], []],
      hand: [['Synthetic Destiny'], []],
      library: [['Plains', 'Wall of Omens', 'Crashing Drawbridge', 'Forest', 'Zetalpa, Primal Dawn'], ['Island']],
    });
    tg.cast('Synthetic Destiny').resolve();
    expect(tg.names(0, 'exile').sort()).toEqual(['Elvish Mystic', 'Indomitable Ancients']);
    expect(tg.find('Wall of Omens')).toBeNull(); // nada volta antes da etapa final
    // para no início da etapa final, com o gatilho atrasado na pilha
    tg.passUntil((x) => x.state.turn.step === 'end' && x.state.zones.stack.length > 0);
    tg.resolve();
    expect(tg.find('Wall of Omens', 'battlefield', 0)).not.toBeNull();
    expect(tg.find('Crashing Drawbridge', 'battlefield', 0)).not.toBeNull();
    expect(tg.find('Zetalpa, Primal Dawn')).toBeNull();
    // as exiladas continuam no exílio e não entram no embaralhamento
    expect(tg.names(0, 'exile').sort()).toEqual(['Elvish Mystic', 'Indomitable Ancients']);
    expect(tg.names(0, 'library').sort()).toEqual(['Forest', 'Plains', 'Zetalpa, Primal Dawn']);
    // o gatilho de entrar da Wall vai para a pilha depois
    expect(tg.state.zones.stack.length).toBe(1);
  });

  it('fichas exiladas contam para o número de cartas de criatura', () => {
    const tg = setup({
      battlefield: [[...ilhas, 'Elvish Mystic', { name: 'Soldier', token: true }], []],
      hand: [['Synthetic Destiny'], []],
      library: [['Indomitable Ancients', 'Crashing Drawbridge', 'Zetalpa, Primal Dawn'], ['Island']],
    });
    tg.cast('Synthetic Destiny').resolve();
    expect(tg.find('Soldier')).toBeNull();
    tg.passTo('end');
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).not.toBeNull();
    expect(tg.find('Crashing Drawbridge', 'battlefield', 0)).not.toBeNull();
    expect(tg.find('Zetalpa, Primal Dawn')).toBeNull();
  });

  it('embaralha o grimório mesmo revelando só cartas de criatura', () => {
    const resto = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Sol Ring', 'Counterspell', 'Negate'];
    const tg = setup({
      battlefield: [[...ilhas, 'Elvish Mystic'], []],
      hand: [['Synthetic Destiny'], []],
      library: [['Indomitable Ancients', ...resto], ['Island']],
    });
    tg.cast('Synthetic Destiny').resolve().passTo('end');
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).not.toBeNull();
    const agora = tg.names(0, 'library');
    expect([...agora].sort()).toEqual([...resto].sort());
    expect(agora).not.toEqual(resto);
  });

  it('o comandante exilado conta, mesmo indo para a zona de comando', () => {
    const tg = setup({
      battlefield: [[...ilhas, { name: 'Indomitable Ancients', commander: true }], []],
      hand: [['Synthetic Destiny'], []],
      library: [['Plains', 'Elvish Mystic', 'Forest'], ['Island']],
    });
    tg.yes('zona de comando', true);
    tg.cast('Synthetic Destiny').resolve();
    expect(tg.names(0, 'command')).toEqual(['Indomitable Ancients']);
    tg.passTo('end');
    expect(tg.find('Elvish Mystic', 'battlefield', 0)).not.toBeNull();
  });

  it('com menos cartas de criatura no grimório, revela o grimório todo', () => {
    const tg = setup({
      battlefield: [[...ilhas, 'Elvish Mystic', 'Indomitable Ancients', 'Crashing Drawbridge'], []],
      hand: [['Synthetic Destiny'], []],
      library: [['Plains', 'Zetalpa, Primal Dawn', 'Forest'], ['Island']],
    });
    tg.cast('Synthetic Destiny').resolve().passTo('end');
    expect(tg.find('Zetalpa, Primal Dawn', 'battlefield', 0)).not.toBeNull();
    expect(tg.names(0, 'library').sort()).toEqual(['Forest', 'Plains']);
    expect(tg.state.log.some((l) => l.text.includes('Ana revela Plains, Zetalpa, Primal Dawn, Forest'))).toBe(true);
  });

  it('CR 513.2, 603.7b: conjurada na etapa final, espera a próxima etapa final', () => {
    const tg = setup({
      step: 'end',
      battlefield: [[...ilhas, 'Elvish Mystic'], []],
      hand: [['Synthetic Destiny'], []],
      library: [['Indomitable Ancients', 'Plains'], ['Island', 'Island']],
    });
    tg.cast('Synthetic Destiny').resolve();
    expect(tg.state.zones.stack.length).toBe(0);
    tg.passTo('upkeep', 1);
    expect(tg.find('Indomitable Ancients')).toBeNull();
    tg.passTo('end', 1);
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).not.toBeNull();
  });
});
