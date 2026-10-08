// Os decks de verdade (decks/) e o que foi gerado deles (gerado/): arquivos válidos, listas jogáveis legais e
// iguais a gerado/decks.json, e toda carta de qualquer versão com dados Oracle (partidas e prévias nunca quebram).
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import '../../cartas/index.ts';
import { validateDeck } from '../../motor/deck.ts';
import { hasOracle } from '../../motor/oracle.ts';
import { pastasPadrao } from '../../servidor/catalogo/caminhos.ts';
import { Catalogo } from '../../servidor/catalogo/catalogo.ts';
import { nomesDaLista } from '../../servidor/catalogo/gerar.ts';
import { cartaPronta } from '../../servidor/catalogo/prontidao.ts';

const P = pastasPadrao();
const catalogo = new Catalogo({ pasta: P.decks, pronta: cartaPronta });

describe('decks/ e gerado/ de verdade', () => {
  it('um arquivo por deck, com o nome igual ao id e a ordem sem repetir', () => {
    const arquivos = readdirSync(P.decks).filter((f) => f.endsWith('.json') && f !== 'cartas.json' && f !== 'rulings.json');
    const decks = catalogo.todos();
    expect(decks.map((d) => `${d.id}.json`).sort()).toEqual(arquivos.sort());
    expect(new Set(decks.map((d) => d.ordem)).size).toBe(decks.length);
    for (const d of decks) {
      expect(d.atual ?? d.preparacao, d.id).toBeTruthy();
      expect(d.link).toMatch(/^https:\/\/moxfield\.com\/decks\//);
    }
  });

  it('toda carta das listas (atuais e em preparação) tem dados Oracle', () => {
    for (const d of catalogo.todos()) {
      for (const l of [d.atual, d.preparacao]) if (l) for (const n of nomesDaLista(l)) expect(hasOracle(n), `${d.nome}: ${n}`).toBe(true);
    }
  });

  it('as listas jogáveis são legais e são as de gerado/decks.json (rode node ferramentas/decks.ts gerar se mudou)', () => {
    const jogaveis = catalogo.listasJogaveis();
    for (const d of jogaveis) expect(validateDeck(d), d.nome).toEqual([]);
    expect(JSON.parse(readFileSync(join(P.gerado, 'decks.json'), 'utf8'))).toEqual(jogaveis);
  });
});
