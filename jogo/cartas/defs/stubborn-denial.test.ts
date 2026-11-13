import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const SD = 'Stubborn Denial';

describe(SD, () => {
  it('anula a mágica que não é de criatura, a menos que quem a controla pague {1}', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [['Sol Ring', SD, 'Elvish Mystic'], []] });
    tg.cast('Sol Ring');
    // mágica de criatura não é alvo possível
    tg.yes('Pagar {1}', true).choose('mágica alvo', ['Sol Ring']).cast(SD).resolve();
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    expect(tg.find('Sol Ring', 'battlefield', 0)).not.toBeNull();
  });
  it('sem pagar, é anulada', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [['Sol Ring', SD], []] });
    tg.cast('Sol Ring');
    tg.yes('Pagar {1}', false).choose('mágica alvo', ['Sol Ring']).cast(SD).resolve();
    expect(tg.find('Sol Ring', 'graveyard', 0)).not.toBeNull();
  });
  it('com ferocidade, anula sem dar a chance de pagar', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Zetalpa, Primal Dawn'], []], hand: [['Sol Ring', SD], []] });
    let perguntou = false;
    tg.script.push((d) => { if (d.prompt.includes('Pagar {1}')) perguntou = true; return null; });
    tg.cast('Sol Ring');
    tg.choose('mágica alvo', ['Sol Ring']).cast(SD).resolve();
    expect(perguntou).toBe(false);
    expect(tg.find('Sol Ring', 'graveyard', 0)).not.toBeNull();
  });
});
