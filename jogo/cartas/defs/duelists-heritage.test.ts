import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = "Duelist's Heritage";

describe(NOME, () => {
  it('ao atacar, a criatura atacante alvo ganha golpe duplo e causa dano duas vezes', () => {
    const tg = setup({ battlefield: [[NOME, 'Wall of Omens', 'Indomitable Ancients'], []] });
    tg.choose('criatura atacante', ['Indomitable Ancients']).yes("Duelist's Heritage", true);
    tg.attack([['Indomitable Ancients', 1]]).passTo('main2');
    expect(tg.life(1)).toBe(36);
  });

  it('quando o oponente ataca, você pode dar golpe duplo a uma criatura atacante dele', () => {
    const tg = setup({ active: 1, battlefield: [[NOME], ['Indomitable Ancients']] });
    tg.choose('criatura atacante', ['Indomitable Ancients']).yes("Duelist's Heritage", false);
    tg.attack([['Indomitable Ancients', 0]]).passTo('main2', 1);
    expect(tg.life(0)).toBe(38);
  });
});
