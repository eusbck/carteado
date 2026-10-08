import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Bloodghast', () => {
  it('dispara jogando o terreno; só dispara estando no cemitério quando o terreno entra', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [['Bloodghast'], []], hand: [['Swamp'], []] });
    tg.yes('Bloodghast', true).play('Swamp').resolve();
    expect(tg.find('Bloodghast')).not.toBeNull();
  });
  it('não bloqueia; tem ímpeto com um oponente a 10 ou menos', () => {
    const tg = setup({ battlefield: [['Bloodghast'], []] });
    const b = tg.bf('Bloodghast');
    expect(hasKw(tg.g, b, 'cantBlock')).toBe(true);
    expect(hasKw(tg.g, b, 'haste')).toBe(false);
    tg.state.players[1].life = 10;
    tg.state.version++;
    expect(hasKw(tg.g, b, 'haste')).toBe(true);
  });
});
