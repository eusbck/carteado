// Fora da lei é uma designação (CR 700.12), não um tipo de criatura (CR 205.3m).
import { describe, expect, it } from 'vitest';
import { allCreatureTypes, hasOutlawType, isOutlaw, untilEndOfTurn } from '../motor/api.ts';
import { setup } from './harness.ts';

describe('Fora da lei (CR 700.12)', () => {
  it.each(['Assassin', 'Mercenary', 'Pirate', 'Rogue', 'Warlock'])('CR 700.12: %s basta mesmo com outros tipos', (tipo) => {
    expect(hasOutlawType({ subtypes: ['Human', tipo, 'Artificer'] })).toBe(true);
  });
  it('CR 700.12: não inclui outros tipos; fora da lei não pode ser escolhido como tipo de criatura', () => {
    expect(hasOutlawType({ subtypes: ['Human', 'Soldier'] })).toBe(false);
    expect(allCreatureTypes()).not.toContain('Outlaw');
  });
  it('CR 700.12: cartas e mágicas também podem ser fora da lei quando a instrução se refere a essas zonas', () => {
    const tg = setup({ battlefield: [Array(4).fill('Island'), []], hand: [['Whirler Rogue'], []], graveyard: [['Pitiless Plunderer'], []] });
    expect(isOutlaw(tg.g, tg.find('Whirler Rogue', 'hand')!)).toBe(true);
    expect(isOutlaw(tg.g, tg.find('Pitiless Plunderer', 'graveyard')!)).toBe(true);
    tg.cast('Whirler Rogue');
    expect(isOutlaw(tg.g, tg.state.zones.stack[0])).toBe(true);
  });
  it('CR 700.12: usa os tipos atuais, inclusive polimorfo e alterações temporárias', () => {
    const tg = setup({ battlefield: [['Mothdust Changeling', 'Indomitable Ancients'], []] });
    expect(isOutlaw(tg.g, tg.bf('Mothdust Changeling'))).toBe(true);
    const id = tg.bf('Indomitable Ancients');
    expect(isOutlaw(tg.g, id)).toBe(false);
    untilEndOfTurn({ g: tg.g, you: 0, source: id }, [id], [{ k: 'addTypes', subtypes: ['Warlock'] }]);
    expect(isOutlaw(tg.g, id)).toBe(true);
  });
});
