import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Deep Analysis', () => {
  it('o jogador alvo compra duas', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [['Deep Analysis'], []], library: [[], ['Plains', 'Plains']] });
    tg.choose('jogador alvo', ['Bruno']).cast('Deep Analysis').resolve();
    expect(tg.names(1, 'hand').length).toBe(2);
  });
  it('por recapitular, paga 3 de vida e vai para o exílio', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], graveyard: [['Deep Analysis'], []], library: [['Plains', 'Plains'], []] });
    tg.choose('jogador alvo', ['Ana']).cast('Deep Analysis', 'flashback');
    expect(tg.life(0)).toBe(37);
    tg.resolve();
    expect(tg.names(0, 'hand').length).toBe(2);
    expect(tg.names(0, 'exile')).toEqual(['Deep Analysis']);
  });
});
