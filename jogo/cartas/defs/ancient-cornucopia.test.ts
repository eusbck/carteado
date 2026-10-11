import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ancient Cornucopia';

describe(N, () => {
  it('conjurando uma mágica de três cores, você pode ganhar 3 de vida', () => {
    // Oros, the Avenger é branco, preto e vermelho
    const tg = setup({ battlefield: [[N, 'Plains', 'Swamp', 'Mountain', 'Island', 'Island', 'Island'], []], hand: [['Oros, the Avenger'], []] });
    tg.yes('Ancient Cornucopia', true);
    tg.cast('Oros, the Avenger').resolveAll();
    expect(tg.life(0)).toBe(43);
  });

  it('depois de ganhar vida assim, não dispara mais no turno', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest', 'Forest'], []], hand: [['Elvish Mystic', 'Elvish Mystic', 'Sol Ring'], []] });
    // mágica incolor não dispara
    tg.cast('Sol Ring').resolveAll();
    expect(tg.life(0)).toBe(40);
    tg.yes('Ancient Cornucopia', true);
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.life(0)).toBe(41);
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Ancient Cornucopia')) throw new Error('não devia disparar'); return null; });
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.life(0)).toBe(41);
  });
});