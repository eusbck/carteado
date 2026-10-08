// Geração de gerado/: com os dados reais, a saída é igual à que está no repositório; com decks importados, nada
// que já esteve no jogo se perde e as fichas novas vão para o fim.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { pastasPadrao } from '../../servidor/catalogo/caminhos.ts';
import { Catalogo } from '../../servidor/catalogo/catalogo.ts';
import { gerar, lerAnterior, lerNovas, lerOriginais, novasVazias, type Anterior } from '../../servidor/catalogo/gerar.ts';
import { paraCarta, paraImpressao } from '../../servidor/catalogo/scryfall.ts';
import type { DeckArquivo, VersaoLista } from '../../servidor/catalogo/tipos.ts';
import { cartaFalsa } from './ajuda.ts';

const P = pastasPadrao();
const temOriginais = existsSync(join(P.cartasOriginais, 'data', 'cards.json'));

const versao = (comandante: string, nomes: string[]): VersaoLista => ({
  comandante, cartas: nomes.map((nome) => ({ nome, quantidade: 1 })), origem: { versao: 1, atualizadoEm: null }, desde: '2026-10-07T00:00:00.000Z',
});
const deck = (id: string, ordem: number, atual: VersaoLista | null, preparacao: VersaoLista | null = null): DeckArquivo => ({
  formato: 1, id, ordem, nome: id, link: `https://moxfield.com/decks/${id}`, importadoEm: '2026-10-07T00:00:00.000Z', verificadoEm: null, atual, preparacao,
});

describe('gerar', () => {
  it.skipIf(!temOriginais)('com ../cartas e decks/ de hoje, a saída é a mesma de gerado/ no repositório', () => {
    const s = gerar({ originais: lerOriginais(P.cartasOriginais), novas: lerNovas(P.decks), decks: new Catalogo({ pasta: P.decks, pronta: () => true }).todos(), anterior: lerAnterior(P.gerado) });
    const ler = (n: string) => readFileSync(join(P.gerado, n), 'utf8');
    expect(JSON.stringify(s.cartas, null, 1) + '\n').toBe(ler('cartas.json'));
    expect(JSON.stringify(s.decks, null, 1) + '\n').toBe(ler('decks.json'));
    expect(JSON.stringify(s.imagens, null, 1) + '\n').toBe(ler('imagens.json'));
  });

  it('cartas novas e fichas novas, decks na ordem fixa, nomes antigos mantidos', () => {
    const anterior: Anterior = {
      cartas: { cartas: { Velha: { name: 'Velha', oracleId: 'o-velha', layout: 'normal', manaValue: 1, colorIdentity: [], keywords: [], faces: [] } }, fichas: [{ name: 'Ficha velha', oracleId: 'o-fv', layout: 'token', manaValue: 0, colorIdentity: [], keywords: [], faces: [], imagem: null }] },
      imagens: { Velha: { en: { id: 'img-velha', frente: 'x', verso: null }, pt: null } },
    };
    const nova = cartaFalsa('Carta Nova');
    const pt = { ...nova, id: 'pt-1', lang: 'pt', printed_name: 'Carta Nova em Português', image_status: 'placeholder' };
    const ficha = cartaFalsa('Soldado', { layout: 'token', type_line: 'Token Creature — Soldier' });
    const novas = novasVazias();
    novas.cards[nova.oracle_id!] = paraCarta(nova, [nova.id, pt.id]);
    novas.printings[nova.id] = paraImpressao(nova, [{ face: 'front', path: `imagens/${nova.id}/front.png` }]);
    novas.printings[pt.id] = paraImpressao(pt, []);
    novas.escolhas['Carta Nova'] = { en: nova.id, pt: pt.id };
    novas.cards[ficha.oracle_id!] = paraCarta(ficha, [ficha.id]);
    novas.printings[ficha.id] = paraImpressao(ficha, []);
    novas.fichas.push(ficha.oracle_id!);
    const decks = [
      deck('Segundo12', 1, versao('Velha', ['Carta Nova'])),
      deck('Primeiro1', 0, versao('Velha', [])),
      deck('Preparado', 2, null, versao('Carta Nova', ['Velha'])),
      deck('SemDados1', 3, versao('Velha', ['Carta Que Nao Existe'])),
    ];
    const s = gerar({ originais: { cards: {}, printings: {}, decks: [] }, novas, decks, anterior });
    expect(Object.keys(s.cartas.cartas)).toEqual(['Carta Nova', 'Velha']);
    expect(s.cartas.fichas.map((f) => f.name)).toEqual(['Ficha velha', 'Soldado']);
    expect(s.decks.map((d) => d.id)).toEqual(['Primeiro1', 'Segundo12']);
    expect(s.imagens['Carta Nova']).toMatchObject({ en: { id: nova.id, frente: `imagens/${nova.id}/front.png` }, pt: { id: 'pt-1', nome: 'Carta Nova em Português', reserva: true } });
    expect(s.imagens.Velha?.en?.id).toBe('img-velha');
    expect(s.avisos.some((a) => a.includes('SemDados1'))).toBe(true);
  });
});
