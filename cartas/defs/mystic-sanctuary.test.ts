import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

describe('Mystic Sanctuary', () => {
  it('é Island ({U})', () => expect(alternativasDeMana('Mystic Sanctuary')).toEqual(['U']));
  it('entra virado sem três outras Islands', () => expect(entraVirado('Mystic Sanctuary', ['Island', 'Island'])).toBe(true));
  it('com três Islands entra desvirado e pode pôr uma mágica do cemitério no topo', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [['Mystic Sanctuary'], []], graveyard: [['Counterspell'], []], library: [['Plains'], []] });
    tg.yes('topo', true).choose('instantânea ou feitiço', ['Counterspell']).play('Mystic Sanctuary').resolve();
    expect(tg.names(0, 'library')).toEqual(['Counterspell', 'Plains']);
  });
  it('entrando virado, o gatilho não acontece', () => {
    const tg = setup({ hand: [['Mystic Sanctuary'], []], graveyard: [['Counterspell'], []] });
    tg.play('Mystic Sanctuary');
    expect(tg.state.zones.stack.length).toBe(0);
  });
});
