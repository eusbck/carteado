import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';
import { chars } from '../../motor/chars.ts';

const NOME = 'Godless Shrine';

/** joga o terreno da mão respondendo à pergunta dos 2 de vida */
function jogar(paga: boolean, vida = 40) {
  const tg = setup({ battlefield: [[], []], hand: [[NOME], []], life: vida });
  let perguntou = false;
  tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('pagar 2 de vida') ? (perguntou = true, { kind: 'select', ids: [paga ? 'yes' : 'no'] }) : null));
  tg.play(NOME);
  return { tg, perguntou: () => perguntou, virado: tg.state.objects[tg.bf(NOME)].tapped };
}

describe(NOME, () => {
  it('CR 305.6: mana dos tipos Plains e Swamp', () => expect(alternativasDeMana(NOME)).toEqual(['B', 'W']));
  it('pagando 2 de vida, entra desvirado', () => {
    const { tg, virado } = jogar(true);
    expect(virado).toBe(false);
    expect(tg.life(0)).toBe(38);
  });
  it('sem pagar, entra virado e a vida não muda', () => {
    const { tg, virado } = jogar(false);
    expect(virado).toBe(true);
    expect(tg.life(0)).toBe(40);
  });
  it('CR 119.4: com menos de 2 de vida não pode pagar e entra virado', () => {
    const { tg, virado, perguntou } = jogar(true, 1);
    expect(perguntou()).toBe(false);
    expect(virado).toBe(true);
    expect(tg.life(0)).toBe(1);
  });
  it('posto no campo virado por um efeito, pode pagar 2 de vida mas continua virado', () => {
    // Arboreal Grazer põe um terreno da mão no campo virado
    const tg = setup({ battlefield: [['Forest'], []], hand: [['Arboreal Grazer', NOME], []] });
    tg.yes('pagar 2 de vida', true).choose('terreno da mão', [NOME]).cast('Arboreal Grazer').resolve().resolve();
    expect(tg.life(0)).toBe(38);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
  it('CR 305.6 e 305.8: tem dois tipos básicos de terreno, mas não é básico', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    const ch = chars(tg.g, tg.bf(NOME));
    expect(ch.subtypes).toEqual(['Plains', 'Swamp']);
    expect(ch.supertypes).toEqual([]);
    // conta para quem olha o tipo (Isolated Chapel)…
    expect(entraVirado('Isolated Chapel', [NOME])).toBe(false);
    // …mas não é achado por quem procura terreno básico (Evolving Wilds)
    const busca = setup({ battlefield: [['Evolving Wilds'], []], library: [[NOME], []] });
    busca.activate('Evolving Wilds', 'Sacrifique').resolve();
    expect(busca.names(0, 'library')).toEqual([NOME]);
  });
});
