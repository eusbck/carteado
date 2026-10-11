import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';

const NOME = "Choked Estuary";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["B","U"]));
  it('entra virado sem Island nem Swamp na mão', () => expect(entraVirado(NOME, [], ['Command Tower'])).toBe(true));
  it('revelando Island da mão, entra desvirado', () => expect(entraVirado(NOME, [], ['Island'], true)).toBe(false));
  it('revelando Swamp da mão, entra desvirado', () => expect(entraVirado(NOME, [], ['Swamp'], true)).toBe(false));
  it('pode não revelar e entrar virado', () => expect(entraVirado(NOME, [], ['Swamp'], false)).toBe(true));
  it('outro Choked Estuary na mão não serve para revelar (não tem os subtipos)', () => {
    let perguntou = false;
    const tg = setup({ battlefield: [[], []], hand: [[NOME, NOME], []] });
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Revelar')) perguntou = true; return null; });
    tg.play(NOME);
    expect(perguntou).toBe(false);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
  it('posto no campo virado por um efeito, continua virado mesmo revelando', () => {
    // Arboreal Grazer põe um terreno da mão no campo virado
    const tg = setup({ battlefield: [['Forest'], []], hand: [['Arboreal Grazer', NOME, 'Island'], []] });
    let perguntou = false;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Revelar') ? (perguntou = true, { kind: 'select', ids: ['yes'] }) : null));
    tg.choose('terreno da mão', [NOME]).cast('Arboreal Grazer').resolve().resolve();
    expect(perguntou).toBe(true);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
  it('revelar um terreno não básico com o subtipo serve', () => expect(entraVirado(NOME, [], ['Fetid Pools'], true)).toBe(false));
});
