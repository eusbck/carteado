import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { analisar, bracketDe, complexidadeDe, GAME_CHANGERS, gravarForca, hashLista, lerForca, type AnaliseForca, type DadosCarta } from '../../servidor/catalogo/forca.ts';
import type { Rede } from '../../servidor/catalogo/rede.ts';
import type { Lista } from '../../servidor/catalogo/tipos.ts';

const lista = (extras: string[] = []): Lista => ({
  comandante: 'Comandante Teste',
  cartas: [{ nome: 'Forest', quantidade: 30 }, ...extras.map((nome) => ({ nome, quantidade: 1 })), ...Array.from({ length: 69 - extras.length }, (_, i) => ({ nome: `Carta ${i}`, quantidade: 1 }))],
});
const analise = (l: Lista, o: Partial<AnaliseForca> = {}): AnaliseForca => ({
  lista: hashLista(l), etiqueta: 'E', gameChangers: [], terrenosEmMassa: [], turnosExtras: [], combos: [], conferidoEm: '2026-11-13T00:00:00Z', ...o,
});

describe('bracket dos decks', () => {
  it('a lista oficial tem 53 Game Changers', () => {
    expect(new Set(GAME_CHANGERS).size).toBe(53);
  });

  it('sem nada forte: 2 (Básico), nunca 1 pela conta', () => {
    const l = lista();
    expect(bracketDe('Deck', l, analise(l))).toMatchObject({ bracket: 2, estimado: false });
  });

  it('até três Game Changers: 3; quatro ou mais: 4', () => {
    const tres = lista(['Sol Ring', 'Rhystic Study', 'Smothering Tithe', 'Cyclonic Rift']);
    expect(bracketDe('Deck', tres, null)).toMatchObject({ bracket: 3, estimado: true, gameChangers: ['Rhystic Study', 'Smothering Tithe', 'Cyclonic Rift'] });
    const quatro = lista(['Rhystic Study', 'Smothering Tithe', 'Cyclonic Rift', 'Demonic Tutor']);
    expect(bracketDe('Deck', quatro, null).bracket).toBe(4);
  });

  it('destruição de terrenos em massa ou combo que vence cedo (Ruthless): 4', () => {
    const l = lista(['Armageddon']);
    expect(bracketDe('Deck', l, analise(l, { terrenosEmMassa: ['Armageddon'] })).bracket).toBe(4);
    const c = lista();
    const combo = { cartas: ["Thassa's Oracle", 'Tainted Pact'], resultado: ['Win the game'], duasCartas: true, relevante: true };
    const f = bracketDe('Deck', c, analise(c, { etiqueta: 'R', combos: [combo] }));
    expect(f.bracket).toBe(4);
    expect(f.motivos[0]).toContain("Thassa's Oracle + Tainted Pact");
  });

  it('combo para o fim do jogo (Spicy): 3', () => {
    const l = lista();
    const combo = { cartas: ['A', 'B', 'C'], resultado: ['Infinite mana'], duasCartas: false, relevante: true };
    expect(bracketDe('Deck', l, analise(l, { etiqueta: 'S', combos: [combo] })).bracket).toBe(3);
  });

  it('4 que se declara cEDH vira 5', () => {
    const l = lista(['Rhystic Study', 'Smothering Tithe', 'Cyclonic Rift', 'Demonic Tutor']);
    expect(bracketDe('[cEDH] Teste', l, null).bracket).toBe(5);
    expect(bracketDe('[cEDH] Teste', lista(), null).bracket).toBe(2);
  });

  it('a análise de outra lista não vale: volta a estimativa', () => {
    const l = lista(['Armageddon']);
    const velha = analise(lista(), { terrenosEmMassa: ['Armageddon'] });
    expect(bracketDe('Deck', l, velha)).toMatchObject({ bracket: 2, estimado: true });
  });

  it('o hash não depende da ordem das cartas', () => {
    const l = lista(['X', 'Y']);
    expect(hashLista({ ...l, cartas: [...l.cartas].reverse() })).toBe(hashLista(l));
  });

  it('grava e lê decks/forca.json', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'forca-'));
    expect(lerForca(pasta).decks).toEqual({});
    gravarForca(pasta, { formato: 1, decks: { abc: analise(lista()) } });
    expect(lerForca(pasta).decks.abc.etiqueta).toBe('E');
  });

  it('pede ao Spellbook com comandante e cartas e lê as marcações', async () => {
    let pedido: unknown = null;
    const rede: Rede = {
      json: async <T,>(_url: string, o?: { corpo?: unknown }) => {
        pedido = o?.corpo;
        return {
          bracketTag: 'R',
          cards: [{ card: { name: 'Armageddon' }, gameChanger: false, massLandDenial: true, extraTurn: false }, { card: 'Rhystic Study', gameChanger: true, massLandDenial: false, extraTurn: false }],
          combos: [{ combo: { uses: [{ card: { name: 'A' } }, { card: { name: 'B' } }], produces: [{ feature: { name: 'Infinite mana' } }] }, relevant: true, definitelyTwoCard: true, massLandDenial: false, extraTurn: false }],
        } as T;
      },
      binario: async () => Buffer.alloc(0),
    };
    const l = lista(['Armageddon']);
    const a = await analisar(rede, l, new Date('2026-11-13T00:00:00Z'));
    expect(pedido).toMatchObject({ commanders: [{ card: 'Comandante Teste', quantity: 1 }] });
    expect((pedido as { main: unknown[] }).main).toHaveLength(70);
    expect(a).toMatchObject({ etiqueta: 'R', gameChangers: ['Rhystic Study'], terrenosEmMassa: ['Armageddon'], combos: [{ cartas: ['A', 'B'], duasCartas: true }] });
  });
});

describe('complexidade dos decks', () => {
  const simples: DadosCarta = { tipos: ['Creature'], texto: 'Trample', palavrasChave: ['Trample'], faces: 1 };
  const dificil: DadosCarta = {
    tipos: ['Instant'],
    texto: 'Choose one —\n• Counter target spell.\n• Search your library for a card, put it into your hand, then shuffle. Whenever you cast a spell from your graveyard, copy it. You may cast it without paying its mana cost.',
    palavrasChave: ['Flashback'], faces: 1,
  };
  const deck = (n: number): Lista => ({ comandante: 'Cmd', cartas: Array.from({ length: 99 }, (_, i) => ({ nome: i < n ? 'Difícil' : 'Simples', quantidade: 1 })) });
  const dados = (n: string) => (n === 'Difícil' ? dificil : simples);

  it('criaturas diretas: Baixa, com o motivo', () => {
    expect(complexidadeDe(deck(0), dados)).toMatchObject({ nivel: 1, motivos: ['cartas diretas, com pouco texto'] });
  });

  it('muitas instantâneas, tutores e cemitério: Alta', () => {
    const c = complexidadeDe(deck(40), dados);
    expect(c.nivel).toBe(3);
    expect(c.motivos.length).toBeGreaterThan(0);
  });

  it('carta sem dados fica de fora', () => {
    expect(complexidadeDe(deck(0), (n) => (n === 'Cmd' ? null : simples)).nivel).toBe(1);
  });
});
