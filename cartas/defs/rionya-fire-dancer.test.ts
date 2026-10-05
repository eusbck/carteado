import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Rionya, Fire Dancer', () => {
  it('conta as mágicas conjuradas no turno; as fichas têm ímpeto e são exiladas na etapa final', () => {
    const tg = setup({ battlefield: [['Rionya, Fire Dancer', 'Elvish Mystic', 'Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Island', 'Island', 'Island'], ['Island']] });
    tg.cast("Night's Whisper").resolve();
    tg.choose('outra criatura alvo', ['Elvish Mystic']);
    tg.passTo('beginCombat').resolve();
    const mystics = tg.all('Elvish Mystic');
    expect(mystics.length).toBe(3);
    expect(mystics.filter((id) => tg.state.objects[id].isToken).every((id) => hasKw(tg.g, id, 'haste'))).toBe(true);
    tg.passTo('end').resolveAll();
    expect(tg.all('Elvish Mystic').length).toBe(1);
  });
});
