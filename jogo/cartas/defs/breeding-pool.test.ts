import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';

const NOME = 'Breeding Pool';

describe(NOME, () => {
  it('CR 305.6: mana dos tipos Forest e Island', () => {
    expect(alternativasDeMana(NOME)).toEqual(['G', 'U']);
    const tg = setup({ battlefield: [[NOME], []] });
    expect(chars(tg.g, tg.bf(NOME)).subtypes).toEqual(['Forest', 'Island']);
  });
  it('pagando 2 de vida entra desvirado', () => {
    const tg = setup({ hand: [[NOME], []] });
    tg.yes('Pagar 2 de vida', true).play(NOME);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(false);
    expect(tg.life(0)).toBe(38);
  });
  it('sem pagar, entra virado', () => {
    const tg = setup({ hand: [[NOME], []] });
    tg.yes('Pagar 2 de vida', false).play(NOME);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
    expect(tg.life(0)).toBe(40);
  });
  it('posto no campo virado por um efeito, entra virado mesmo pagando 2 de vida', () => {
    const tg = setup({ battlefield: [['Forest'], []], hand: [['Arboreal Grazer', NOME], []] });
    tg.yes('Pagar 2 de vida', true).choose('terreno da mão', [NOME]).cast('Arboreal Grazer').resolve().resolve();
    expect(tg.life(0)).toBe(38);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
});
