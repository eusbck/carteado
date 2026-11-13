// Resguardo com custo de sacrificar um permanente de um subtipo ("Ward—Sacrifice a Food", Ygra, Eater of All):
// ward('sacrifice:Food') em motor/mecanicas.ts. CR 702.21a: "Sempre que este permanente se torna alvo de uma mágica ou
// habilidade que um oponente controla, anule essa mágica ou habilidade, a menos que esse jogador pague [custo]."
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';

describe('resguardo — sacrificar um permanente de um subtipo (foods-b)', () => {
  it('CR 702.21a: o oponente sacrifica uma Food e a mágica continua', () => {
    const tg = setup({ active: 1, battlefield: [['Ygra, Eater of All'], ['Swamp', 'Swamp', { name: 'Food', token: true }]], hand: [[], ['Infernal Grasp']] });
    tg.yes('Resguardo', true).choose('criatura alvo', ['Ygra, Eater of All']).cast('Infernal Grasp').resolveAll();
    expect(tg.find('Food')).toBeNull();
    expect(tg.find('Ygra, Eater of All', 'graveyard')).not.toBeNull();
  });

  it('CR 702.21a: sem uma Food para sacrificar, não pode pagar e a mágica é anulada', () => {
    const tg = setup({ active: 1, battlefield: [['Ygra, Eater of All', { name: 'Food', token: true }], ['Swamp', 'Swamp']], hand: [[], ['Infernal Grasp']] });
    let perguntou = false;
    tg.script.push((d) => { if (/Resguardo/.test(d.prompt)) perguntou = true; return null; });
    tg.choose('criatura alvo', ['Ygra, Eater of All']).cast('Infernal Grasp').resolveAll();
    expect(perguntou).toBe(false);
    expect(tg.bf('Ygra, Eater of All')).toBeTruthy();
    // a Food de quem controla a Ygra não serve para o oponente pagar
    expect(tg.bf('Food')).toBeTruthy();
  });
});
