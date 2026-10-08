// Catálogo de decks: diferença entre versões, ordem das cartas numa atualização, listas jogáveis e versões em
// preparação que entram quando as cartas ficam prontas.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Catalogo, diferenca, listasIguais, mesclarOrdem, type InfoDisco } from '../../servidor/catalogo/catalogo.ts';
import type { DeckArquivo, Lista, VersaoLista } from '../../servidor/catalogo/tipos.ts';
import { pastasTemp } from './ajuda.ts';

const l = (comandante: string, ...cartas: [string, number?][]): Lista => ({ comandante, cartas: cartas.map(([nome, quantidade = 1]) => ({ nome, quantidade })) });
const v = (lista: Lista): VersaoLista => ({ ...lista, origem: { versao: null, atualizadoEm: null }, desde: '2026-10-07T00:00:00.000Z' });
const info: InfoDisco = { carta: (nome) => ({ pt: nome === 'A' ? 'A em pt' : null, img: `img-${nome}`, tipo: 'Creature', cores: ['W'] }) };

describe('diferença entre listas', () => {
  it('entram e saem por nome e quantidade; troca de comandante à parte', () => {
    const d = diferenca(l('Cmd', ['A'], ['B'], ['Island', 10]), l('Cmd2', ['B'], ['C'], ['Island', 8]));
    expect(d.entram).toEqual([{ nome: 'C', quantidade: 1 }]);
    expect(d.saem).toEqual([{ nome: 'A', quantidade: 1 }, { nome: 'Island', quantidade: 2 }]);
    expect(d.comandante).toEqual({ de: 'Cmd', para: 'Cmd2' });
    expect(listasIguais(l('X', ['A'], ['B']), l('X', ['B'], ['A']))).toBe(true);
    expect(listasIguais(l('X', ['A']), l('X', ['A', 2]))).toBe(false);
    expect(listasIguais(null, l('X'))).toBe(false);
  });

  it('numa atualização, as cartas que ficam mantêm a posição e as novas vão para o fim', () => {
    const antiga = l('X', ['A'], ['B'], ['C'], ['Island', 5]).cartas;
    const nova = l('X', ['D'], ['Island', 6], ['C'], ['A']).cartas;
    expect(mesclarOrdem(antiga, nova)).toEqual([{ nome: 'A', quantidade: 1 }, { nome: 'C', quantidade: 1 }, { nome: 'Island', quantidade: 6 }, { nome: 'D', quantidade: 1 }]);
    expect(mesclarOrdem(null, nova)).toEqual(nova);
  });
});

describe('Catalogo', () => {
  it('lê os 7 decks de decks/ na ordem fixa, e as listas jogáveis são as de gerado/decks.json', () => {
    const p = pastasTemp();
    const c = new Catalogo({ pasta: p.decks, pronta: () => true });
    const decksGerados = JSON.parse(readFileSync(join(p.gerado, 'decks.json'), 'utf8'));
    expect(c.todos().slice(0, 7).map((d) => d.ordem)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(c.listasJogaveis()).toEqual(decksGerados);
    expect(c.ler('../cartas')).toBeNull();
    expect(c.proximaOrdem()).toBeGreaterThanOrEqual(7);
  });

  it('só é jogável com todas as cartas prontas; a preparação pronta vira a lista atual', () => {
    const p = pastasTemp({ decks: false });
    const prontas = new Set(['Cmd', 'A', 'B']);
    const c = new Catalogo({ pasta: p.decks, pronta: (n) => prontas.has(n) });
    const d: DeckArquivo = { formato: 1, id: 'Deck123456', ordem: 0, nome: 'D', link: 'x', importadoEm: 'x', verificadoEm: null, atual: v(l('Cmd', ['A'])), preparacao: v(l('Cmd', ['A'], ['Nova'])) };
    const novo: DeckArquivo = { ...d, id: 'Novo123456', ordem: 1, atual: null, preparacao: v(l('Cmd', ['Nova'], ['B'])) };
    c.salvar(d);
    c.salvar(novo);
    expect(readdirSync(p.decks).sort()).toEqual(['Deck123456.json', 'Novo123456.json']);
    expect(c.listasJogaveis().map((x) => x.id)).toEqual(['Deck123456']);
    const pub = c.publico(info);
    expect(pub.map((x) => [x.id, x.estado])).toEqual([['Deck123456', 'atualizacao'], ['Novo123456', 'preparacao']]);
    expect(pub[1].preparacao).toMatchObject({ prontas: 2, total: 3, faltam: [{ nome: 'Nova', pronta: false }] });
    expect(pub[0].preparacao?.entram.map((x) => x.nome)).toEqual(['Nova']);
    expect(c.aplicarPreparacoesProntas()).toEqual([]);
    prontas.add('Nova');
    expect(c.aplicarPreparacoesProntas()).toEqual(['Deck123456', 'Novo123456']);
    expect(c.listasJogaveis().map((x) => [x.id, x.cartas.map((y) => y.nome)])).toEqual([['Deck123456', ['A', 'Nova']], ['Novo123456', ['Nova', 'B']]]);
    expect(c.ler('Deck123456')?.preparacao).toBeNull();
  });
});
