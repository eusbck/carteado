import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const L = 'Living Death';
const pantanos = Array(5).fill('Swamp');

describe(L, () => {
  it('exila, sacrifica e devolve ao mesmo tempo para todos os jogadores', () => {
    const tg = setup({
      players: 3,
      battlefield: [[...pantanos, 'Wall of Omens'], ['Indomitable Ancients'], [{ name: 'Saproling', token: true }]],
      hand: [[L], [], []],
      graveyard: [['Elvish Mystic', 'Sol Ring'], ['Llanowar Elves'], []],
    });
    tg.cast(L).resolve();
    // cada um põe no campo as próprias cartas exiladas, sob o seu controle
    expect(tg.names(0, 'battlefield').filter((n) => n !== 'Swamp')).toEqual(['Elvish Mystic']);
    expect(tg.names(1, 'battlefield')).toEqual(['Llanowar Elves']);
    expect(tg.names(2, 'battlefield')).toEqual([]);
    // as sacrificadas ficam no cemitério (não são as exiladas pela primeira instrução)
    expect(tg.names(0, 'graveyard').sort()).toEqual([L, 'Sol Ring', 'Wall of Omens'].sort());
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
    expect(tg.find('Saproling')).toBeNull();
  });
  it('criatura sacrificada que é exilada em vez de ir ao cemitério não volta', () => {
    // marcador de finalidade (CR 122.1h): se fosse ao cemitério, é exilada em vez disso
    const tg = setup({ battlefield: [[...pantanos], [{ name: 'Indomitable Ancients', counters: { finality: 1 } }]], hand: [[L], []], graveyard: [[], ['Llanowar Elves']] });
    tg.cast(L).resolve();
    expect(tg.names(1, 'battlefield')).toEqual(['Llanowar Elves']);
    expect(tg.names(1, 'exile')).toEqual(['Indomitable Ancients']);
  });
});
