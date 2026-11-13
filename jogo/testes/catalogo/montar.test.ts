// Decks montados na mesa (tela Montar deck): as cartas oferecidas, a conferência da lista e as rotas que gravam,
// editam e apagam, com pastas temporárias.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import '../../cartas/index.ts';
import type { DeckList } from '../../motor/state.ts';
import { Catalogo } from '../../servidor/catalogo/catalogo.ts';
import { cartasParaMontar, conferirCriado, lerPedido } from '../../servidor/catalogo/montar.ts';
import { cartaPronta } from '../../servidor/catalogo/prontidao.ts';
import { RotasCatalogo } from '../../servidor/catalogo/rotas.ts';
import { TarefasDecks } from '../../servidor/catalogo/tarefas.ts';
import type { Lista } from '../../servidor/catalogo/tipos.ts';
import type { CartaMontagem } from '../../servidor/protocolo.ts';
import decksTeste from '../decks-teste.json' with { type: 'json' };
import { pastasTemp, RedeFalsa } from './ajuda.ts';

const TERRA = (decksTeste as DeckList[]).find((d) => d.nome === 'Terra')!;
const listaTerra = (): Lista => ({ comandante: TERRA.comandante, cartas: TERRA.cartas.map((c) => ({ ...c })) });
const INFO = { carta: () => null };

function montar() {
  const p = pastasTemp();
  const catalogo = new Catalogo({ pasta: p.decks, pronta: cartaPronta });
  const mudancas: boolean[] = [];
  const tarefas = new TarefasDecks({ pastas: p, rede: new RedeFalsa(), catalogo, pronta: cartaPronta, artes: false, aoMudar: (x) => mudancas.push(x) });
  const rotas = new RotasCatalogo({ catalogo, tarefas, info: INFO, pronta: cartaPronta });
  const pedir = (caminho: string, corpo: unknown) => rotas.gravacao('POST', caminho, JSON.stringify(corpo))!;
  return { p, catalogo, rotas, pedir, mudancas };
}

describe('cartas para montar', () => {
  const cartas = cartasParaMontar(cartaPronta);
  const por = new Map(cartas.map((c) => [c.nome, c]));

  it('só cartas com regras, sem fichas, com o comandante marcado', () => {
    expect(cartas.length).toBeGreaterThan(500);
    expect(cartas.every((c) => cartaPronta(c.nome))).toBe(true);
    expect(por.get(TERRA.comandante!)).toMatchObject({ comandante: true });
    expect(por.get('Arcane Signet')).toMatchObject({ comandante: false, vm: 2, ci: [] });
    expect(por.get('Arcane Signet')!.teto).toBeUndefined();
  });

  it('básicos sem limite de cópias', () => {
    expect(por.get('Plains')?.teto).toBe(0);
    expect(por.get('Forest')?.teto).toBe(0);
  });

  it('parceiros: cada um aponta para quem forma dupla com ele', () => {
    const comParceiro = cartas.filter((c): c is CartaMontagem & { parceiros: string[] } => !!c.parceiros?.length);
    expect(comParceiro.length).toBeGreaterThan(0);
    for (const c of comParceiro) for (const o of c.parceiros) expect(por.get(o)?.parceiros).toContain(c.nome);
  });
});

describe('conferir a lista', () => {
  it('a lista de Terra passa', () => {
    expect(conferirCriado(listaTerra(), cartaPronta).erros).toEqual([]);
  });

  it('contagem, identidade de cor, cópias e carta desconhecida', () => {
    const curta = listaTerra();
    curta.cartas.pop();
    expect(conferirCriado(curta, cartaPronta).erros.join('\n')).toMatch(/precisa de 100/);

    const fora = listaTerra();
    const i = fora.cartas.findIndex((c) => c.nome === 'Arcane Signet');
    fora.cartas[i] = { nome: 'Island', quantidade: 1 };
    expect(conferirCriado(fora, cartaPronta).erros.join('\n')).toMatch(/Island/);

    const repetida = listaTerra();
    const j = repetida.cartas.findIndex((c) => c.nome === 'Arcane Signet');
    repetida.cartas[j] = { nome: 'Arcane Signet', quantidade: 2 };
    repetida.cartas.splice(repetida.cartas.findIndex((c) => c.nome === 'Thrill of Possibility'), 1);
    expect(conferirCriado(repetida, cartaPronta).erros.join('\n')).toMatch(/Arcane Signet aparece 2 vezes/);

    const inventada = listaTerra();
    inventada.cartas[0] = { nome: 'Carta Que Não Existe', quantidade: 1 };
    expect(conferirCriado(inventada, cartaPronta).erros).toEqual(['Carta Que Não Existe não está entre as cartas do jogo']);
  });

  it('o pedido: nome obrigatório e quantidades válidas', () => {
    expect(lerPedido({ nome: ' ', comandante: 'x', cartas: [] })).toBe('Dê um nome ao deck');
    expect(lerPedido({ nome: 'a', comandante: 'x', cartas: [{ nome: 'y', quantidade: 0 }] })).toBe('Pedido inválido');
    expect(lerPedido({ nome: '  Meu   deck ', comandante: 'x', cartas: [{ nome: 'y', quantidade: 1 }, { nome: 'y', quantidade: 2 }] }))
      .toEqual({ nome: 'Meu deck', lista: { comandante: 'x', cartas: [{ nome: 'y', quantidade: 3 }] } });
  });
});

describe('gravar, editar e apagar', () => {
  it('um deck montado entra no saguão, pode ser editado e apagado', async () => {
    const { p, catalogo, rotas, pedir, mudancas } = montar();
    const antes = catalogo.listasJogaveis().length;
    const l = listaTerra();
    const r = await pedir('/api/catalogo/montar', { nome: 'Terra da casa', comandante: l.comandante, cartas: l.cartas, autor: 'Caio' });
    expect(r.status).toBe(201);
    const id = (r.corpo as { id: string }).id;
    expect(id).toMatch(/^c-/);
    expect(mudancas).toEqual([true]);
    const d = catalogo.ler(id)!;
    expect(d).toMatchObject({ nome: 'Terra da casa', link: '', preparacao: null, criado: { autor: 'Caio' } });
    expect(catalogo.listasJogaveis().length).toBe(antes + 1);
    const gerados = JSON.parse(readFileSync(join(p.gerado, 'decks.json'), 'utf8')) as DeckList[];
    expect(gerados.some((x) => x.id === id)).toBe(true);
    expect(catalogo.publico(INFO).find((x) => x.id === id)?.criado?.autor).toBe('Caio');
    expect(catalogo.publico(INFO).find((x) => x.id === id)?.origem.tipo).toBe('montado');

    // editar: troca uma carta, o id e o autor ficam, e as cartas que ficam mantêm a posição
    // sai Arcane Signet, entra mais um básico que a lista já tem
    const basico = l.cartas.find((c) => ['Plains', 'Swamp', 'Mountain'].includes(c.nome))!;
    const nova = l.cartas.filter((c) => c.nome !== 'Arcane Signet').map((c) => (c === basico ? { ...c, quantidade: c.quantidade + 1 } : c)).reverse();
    const e = await pedir('/api/catalogo/montar', { id, nome: 'Terra 2', comandante: l.comandante, cartas: nova, autor: 'Outra pessoa' });
    expect(e).toEqual({ status: 200, corpo: { id } });
    const d2 = catalogo.ler(id)!;
    expect(d2.nome).toBe('Terra 2');
    expect(d2.criado?.autor).toBe('Caio');
    expect(d2.atual!.cartas.map((c) => c.nome)).toEqual(d.atual!.cartas.map((c) => c.nome).filter((n) => n !== 'Arcane Signet'));
    expect(d2.atual!.cartas.find((c) => c.nome === basico.nome)!.quantidade).toBe(basico.quantidade + 1);

    // apagar
    expect(await pedir(`/api/catalogo/${id}/apagar`, {})).toEqual({ status: 200, corpo: { ok: true } });
    expect(catalogo.ler(id)).toBeNull();
    expect(catalogo.listasJogaveis().length).toBe(antes);
    expect(rotas.gravacao('GET', '/api/catalogo/montar', '')).toBeNull();
  }, 60_000);

  it('lista que quebra regra não grava; decks do Moxfield não se editam nem se apagam por aqui', async () => {
    const { catalogo, pedir } = montar();
    const l = listaTerra();
    const n = catalogo.todos().length;
    const r = await pedir('/api/catalogo/montar', { nome: 'Curto', comandante: l.comandante, cartas: l.cartas.slice(1) });
    expect(r.status).toBe(400);
    expect((r.corpo as { erros: string[] }).erros.join()).toMatch(/precisa de 100/);
    expect(catalogo.todos().length).toBe(n);

    const moxfield = catalogo.todos().find((d) => d.link)!;
    expect((await pedir('/api/catalogo/montar', { id: moxfield.id, nome: 'x', comandante: l.comandante, cartas: l.cartas })).status).toBe(404);
    expect((await pedir(`/api/catalogo/${moxfield.id}/apagar`, {})).status).toBe(404);
    expect(catalogo.ler(moxfield.id)).not.toBeNull();
  }, 60_000);
});
