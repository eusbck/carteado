import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Lightning, Army of One';

describe(N, () => {
  it('depois do dano de combate de Lightning, o dano a esse jogador e às permanentes dele dobra até o seu próximo turno', () => {
    const tg = setup({ battlefield: [[N, 'Mountain'], ['Wall of Omens']], hand: [['Lightning Bolt'], []], step: 'beginCombat' });
    tg.attack([[N, 1]]).passTo('main2', 0);
    // 3 de golpe inicial; vínculo com a vida
    expect(tg.life(1)).toBe(37);
    expect(tg.life(0)).toBe(43);
    tg.choose('alvo', ['Bruno']).cast('Lightning Bolt').resolve();
    expect(tg.life(1)).toBe(37 - 6);
  });

  it('o dano é dividido antes de dobrar (atropelar: o excedente ao jogador também dobra)', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', { name: 'Loxodon Warhammer', attachTo: 'Silver Myr' }], ['Llanowar Elves']], step: 'beginCombat' });
    // Lightning causa 3 no golpe inicial; no dano normal, o Myr (4/1, atropelar) põe 1 no elfo e 3 no jogador, dobrados
    tg.attack([[N, 1], ['Silver Myr', 1]]).block([['Llanowar Elves', 'Silver Myr']]).passTo('main2', 0);
    expect(tg.find('Llanowar Elves', 'battlefield', 1)).toBeNull();
    expect(tg.life(1)).toBe(40 - 3 - 6);
  });
});
