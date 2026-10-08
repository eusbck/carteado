// Dados do Scryfall: escolha da impressão (a mesma regra do coletor), conversão para o formato de ../cartas, imagens
// de cartas de duas faces e fichas que a carta cria.
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cartaGerada } from '../../servidor/catalogo/gerar.ts';
import { baixarImagens, colecao, escolherImpressao, impressoes, imagensDe, paraCarta, paraImpressao, partesFicha } from '../../servidor/catalogo/scryfall.ts';
import type { ScryObjeto } from '../../servidor/catalogo/tipos.ts';
import { cartaFalsa, PNG, RedeFalsa } from './ajuda.ts';

const ler = (n: string) => JSON.parse(readFileSync(join(import.meta.dirname, 'dados', `${n}.json`), 'utf8')) as ScryObjeto;
const EN = ler('scryfall-en');
const PT = ler('scryfall-pt');
const DUPLA = ler('scryfall-transform');

describe('escolherImpressao', () => {
  it('prefere a mesma edição e número, depois papel, imagem em alta e a mais nova', () => {
    const base = cartaFalsa('X', { set: 'aaa', collector_number: '1' });
    const mesma = { ...base, id: '1', lang: 'pt', set: 'aaa', collector_number: '1', highres_image: false, image_status: 'lowres', released_at: '2000-01-01' };
    const nova = { ...base, id: '2', lang: 'pt', set: 'zzz', collector_number: '9', released_at: '2030-01-01' };
    expect(escolherImpressao([nova, mesma], base)?.id).toBe('1');
    const digital = { ...nova, id: '3', digital: true, released_at: '2040-01-01' };
    expect(escolherImpressao([digital, nova])?.id).toBe('2');
    const baixa = { ...nova, id: '4', highres_image: false, image_status: 'lowres', released_at: '2040-01-01' };
    expect(escolherImpressao([baixa, nova])?.id).toBe('2');
    expect(escolherImpressao([])).toBeNull();
  });
});

describe('conversão', () => {
  it('carta real: identidade de jogo no formato de cards.json e no de gerado/cartas.json', () => {
    const c = paraCarta(EN, [EN.id, PT.id]);
    expect(c.id).toBe(EN.oracle_id);
    expect(c.name).toBe('Ravenous Chupacabra');
    expect(c.printing_ids).toEqual([EN.id, PT.id].sort());
    const g = cartaGerada(c);
    expect(g.faces[0]).toMatchObject({ types: ['Creature'], subtypes: ['Beast', 'Horror'], power: 2, toughness: 2, manaCost: '{2}{B}{B}' });
    expect(g.colorIdentity).toEqual(['B']);
  });

  it('impressão em português guarda nome, tipo e texto impressos', () => {
    const p = paraImpressao(PT, []);
    expect(p.lang).toBe('pt');
    expect(p.printed_name).toBe(PT.printed_name);
    expect(p.printed_text).toBe(PT.printed_text);
  });

  it('carta de duas faces: duas faces nos dados e duas imagens (frente e verso)', () => {
    const c = cartaGerada(paraCarta(DUPLA, [DUPLA.id]));
    expect(c.faces).toHaveLength(2);
    expect(imagensDe(DUPLA).map((i) => i.face)).toEqual(['front', 'back']);
    expect(imagensDe(EN).map((i) => i.face)).toEqual(['front']);
  });

  it('fichas: só a partir de cartas (nunca de uma ficha de volta para quem a cria)', () => {
    const ficha = cartaFalsa('Soldado', { layout: 'token', type_line: 'Token Creature — Soldier' });
    const carta = cartaFalsa('Recrutador', { all_parts: [{ id: 'self', component: 'combo_piece', name: 'Recrutador' }, { id: ficha.id, component: 'token', name: 'Soldado' }] });
    const fichaComParte = { ...ficha, all_parts: [{ id: carta.id, component: 'combo_piece', name: 'Recrutador' }] };
    expect(partesFicha(carta)).toEqual([ficha.id]);
    expect(partesFicha(fichaComParte)).toEqual([]);
  });
});

describe('pedidos', () => {
  it('coleção em lotes de 75 e o que não foi achado', async () => {
    const rede = new RedeFalsa();
    const cs = Array.from({ length: 80 }, (_, i) => cartaFalsa(`C${i}`));
    rede.carta(...cs.slice(0, 79));
    const r = await colecao(rede, cs.map((c) => c.id));
    expect(r.cartas).toHaveLength(79);
    expect(r.faltam).toEqual([cs[79].id]);
    expect(rede.pedidos.filter((p) => p.startsWith('POST'))).toHaveLength(2);
  });

  it('busca por idioma: lista vazia quando o Scryfall não acha', async () => {
    const rede = new RedeFalsa();
    const c = cartaFalsa('Só inglês');
    rede.carta(c);
    expect(await impressoes(rede, c.oracle_id!, 'pt')).toEqual([]);
    expect((await impressoes(rede, c.oracle_id!, 'en')).map((x) => x.id)).toEqual([c.id]);
  });

  it('imagens vão para <pasta>/<id>/front.png e não são baixadas de novo', async () => {
    const rede = new RedeFalsa();
    const pasta = mkdtempSync(join(tmpdir(), 'imagens-'));
    const c = cartaFalsa('Com imagem');
    const r = await baixarImagens(rede, c, pasta);
    expect(r).toEqual([{ face: 'front', path: `imagens/${c.id}/front.png`, source_url: c.image_uris!.png }]);
    expect(readFileSync(join(pasta, c.id, 'front.png')).equals(PNG)).toBe(true);
    await baixarImagens(rede, c, pasta);
    expect(rede.pedidos.filter((p) => p.includes('cards.scryfall.io'))).toHaveLength(1);
  });
});
