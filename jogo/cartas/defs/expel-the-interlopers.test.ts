import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Expel the Interlopers', () => {
  it('o número escolhido pode ser de 0 a 10', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Sol Ring', 'Sol Ring'], []], hand: [['Expel the Interlopers'], []] });
    let faixa: [number, number] = [-1, -1];
    tg.script.push((d) => { if (d.kind === 'number') { faixa = [d.min, d.max]; return { kind: 'number', value: 3 }; } return null; });
    tg.cast('Expel the Interlopers').resolve();
    expect(faixa).toEqual([0, 10]);
  });
  it('destrói as criaturas com força maior ou igual ao número', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Sol Ring', 'Sol Ring', 'Wall of Omens'], ['Indomitable Ancients', 'Zetalpa, Primal Dawn']], hand: [['Expel the Interlopers'], []] });
    tg.number('número de 0 a 10', 2).cast('Expel the Interlopers').resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull(); // indestrutível
    expect(tg.find('Wall of Omens')).not.toBeNull(); // força 0
  });
});
