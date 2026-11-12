import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { classificar, lerOrigens, origemDe, palpite, type PreconOficial } from '../../servidor/catalogo/origem.ts';
import type { Lista } from '../../servidor/catalogo/tipos.ts';

// um precon de 100 cartas: comandante + 99 cartas diferentes
const cartas = Array.from({ length: 99 }, (_, i) => `Carta ${i}`);
const precon: PreconOficial = { nome: 'Produto Teste', codigo: 'TST', cartas: Object.fromEntries([['Comandante, o Teste', 1], ...cartas.map((c) => [c, 1])]) };
const outro: PreconOficial = { nome: 'Outro', codigo: 'OUT', cartas: { 'Carta 0': 1, 'Carta 1': 1 } };
const lista = (trocas: number): Lista => ({
  comandante: 'Comandante, o Teste',
  cartas: cartas.map((c, i) => ({ nome: i < trocas ? `Nova ${i}` : c, quantidade: 1 })),
});
const deck = { link: 'https://moxfield.com/decks/x', nome: 'Deck' };

describe('origem dos decks', () => {
  it('igual ao produto: precon', () => {
    expect(classificar(deck, lista(0), [outro, precon])).toMatchObject({ tipo: 'precon', produto: 'Produto Teste', codigo: 'TST' });
  });

  it('com poucas trocas: precon modificado, com o número de cartas trocadas', () => {
    expect(classificar(deck, lista(7), [precon, outro])).toMatchObject({ tipo: 'modificado', produto: 'Produto Teste', trocas: 7 });
  });

  it('a carta de exibição repetida na lista oficial não conta como troca', () => {
    const comExibicao = { ...precon, cartas: { ...precon.cartas, 'Comandante, o Teste': 2 } };
    expect(classificar(deck, lista(0), [comExibicao]).tipo).toBe('precon');
  });

  it('nomes iguais com acento, caixa ou a segunda face diferentes', () => {
    const l = lista(0);
    l.cartas[0] = { nome: 'CARTA 0 // Verso', quantidade: 1 };
    expect(classificar(deck, l, [precon]).tipo).toBe('precon');
  });

  it('muito diferente de todo precon: montado', () => {
    expect(classificar(deck, lista(40), [precon, outro])).toMatchObject({ tipo: 'montado' });
    expect(classificar(deck, lista(0), []).tipo).toBe('montado');
  });

  it('sem link: criado aqui', () => {
    expect(classificar({ link: '', nome: 'Deck da casa' }, lista(0), [precon]).tipo).toBe('casa');
  });

  it('sem comparação gravada, o palpite', () => {
    expect(palpite({ link: '', nome: 'x' }).tipo).toBe('casa');
    expect(palpite({ link: 'l', nome: 'Blame Game (Commander Precon Decklist)' }).tipo).toBe('precon');
    expect(palpite({ link: 'l', nome: 'Voja' }).tipo).toBe('montado');
  });

  it('lê decks/origens.json e cai no palpite para quem não está lá', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'origens-'));
    writeFileSync(join(pasta, 'origens.json'), JSON.stringify({ formato: 1, decks: { abc: { tipo: 'modificado', produto: 'P', trocas: 3 } } }));
    const o = lerOrigens(pasta);
    expect(origemDe(o, { id: 'abc', link: 'l', nome: 'A' }).tipo).toBe('modificado');
    expect(origemDe(o, { id: 'def', link: '', nome: 'B' }).tipo).toBe('casa');
    expect(lerOrigens(join(pasta, 'nada')).decks).toEqual({});
  });
});
