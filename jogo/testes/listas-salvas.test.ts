// Importação de decks: uma partida guarda as listas com que começou. Atualizar um deck no meio não muda a partida
// (que se refaz pela semente e pelas entradas depois de um reinício), salas salvas antes desta mudança recebem as
// listas atuais ao subir, e um deck que saiu do saguão não começa partida.
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import type { DeckList } from '../motor/state.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgCliente, MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, preencherListasSalvas, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';
import decksJson from './decks-teste.json' with { type: 'json' };

const DECKS = decksJson as DeckList[];

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  msgs: MsgServidor[] = [];
  enviar(m: MsgServidor) { this.msgs.push(m); }
  ultima<T extends MsgServidor['t']>(t: T): Extract<MsgServidor, { t: T }> | undefined {
    return [...this.msgs].reverse().find((m) => m.t === t) as Extract<MsgServidor, { t: T }> | undefined;
  }
}
const espera = () => new Promise((r) => setTimeout(r, 0));

/** sala 1v1 de Ana (deck 0) contra um bot (deck 1), começada e jogada por algumas decisões */
async function partida(g: Gerente) {
  const ana = new Falsa();
  g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
  const codigo = ana.ultima('sala')!.sala.codigo;
  g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
  g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id });
  g.tratar(ana, { t: 'iniciar' });
  for (let i = 0; i < 12; i++) {
    await espera();
    const d = ana.ultima('jogo')?.vista.decision;
    if (!d) break;
    const r: MsgCliente = d.kind === 'mulligan' ? { t: 'responder', decisao: d.id, resposta: { kind: 'mulligan', keep: true } }
      : d.kind === 'priority' ? { t: 'responder', decisao: d.id, resposta: { kind: 'priority', action: 'pass' } }
      : { t: 'conceder' };
    g.tratar(ana, r);
  }
  return { ana, codigo };
}

/** o deck 0 com a ordem e duas cartas mudadas (como depois de uma atualização) */
function decksAtualizados(): DeckList[] {
  const d0 = structuredClone(DECKS[0]);
  d0.cartas = [...d0.cartas.slice(2).reverse(), ...d0.cartas.slice(0, 2)];
  return [d0, ...DECKS.slice(1)];
}

describe('listas guardadas na partida', () => {
  it('a partida guarda as listas; trocar os decks e reiniciar o servidor não muda nada', async () => {
    const banco = new Banco(':memory:');
    const g = new Gerente(banco, DECKS, SEM_ATRASO);
    const { codigo } = await partida(g);
    const s = g.salas.get(codigo)!;
    const estado = JSON.stringify(s.game!.state);
    g.trocarDecks(decksAtualizados());
    expect(g.deck(DECKS[0].id)?.cartas[0]).not.toEqual(DECKS[0].cartas[0]);
    const g2 = new Gerente(banco, decksAtualizados(), SEM_ATRASO);
    g2.restaurar();
    // a partida pode ter acabado (Ana concede numa decisão que não sabe responder): a encerrada é refeita quando
    // alguém volta, não ao subir
    g2.salas.get(codigo)!.garantirPartida();
    await espera();
    expect(g2.salas.get(codigo)!.erro).toBeNull();
    expect(JSON.stringify(g2.salas.get(codigo)!.game!.state)).toBe(estado);
    expect((banco.salas().find((x) => x.codigo === codigo)!.dados as { partida: { listas: DeckList[] } }).partida.listas[0]).toEqual(DECKS[0]);
  }, 60000);

  it('sala salva antes da importação de decks recebe as listas atuais ao subir (e na linha de comando)', async () => {
    const banco = new Banco(':memory:');
    const g = new Gerente(banco, DECKS, SEM_ATRASO);
    const { codigo } = await partida(g);
    const estado = JSON.stringify(g.salas.get(codigo)!.game!.state);
    const tirarListas = () => {
      const dados = banco.salas().find((x) => x.codigo === codigo)!.dados as { partida: { listas?: DeckList[] } };
      delete dados.partida.listas;
      banco.salvarSala(codigo, dados);
    };
    const listasSalvas = () => (banco.salas().find((x) => x.codigo === codigo)!.dados as { partida: { listas?: DeckList[] } }).partida.listas;
    tirarListas();
    expect(preencherListasSalvas(banco, DECKS)).toBe(1);
    expect(listasSalvas()?.map((l) => l.id)).toEqual([DECKS[0].id, DECKS[1].id]);
    tirarListas();
    const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
    g2.restaurar();
    g2.salas.get(codigo)!.garantirPartida();
    await espera();
    expect(listasSalvas()?.[0]).toEqual(DECKS[0]);
    expect(JSON.stringify(g2.salas.get(codigo)!.game!.state)).toBe(estado);
  }, 60000);

  it('um deck que saiu do saguão não começa partida', () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id });
    g.trocarDecks(DECKS.filter((d) => d.id !== DECKS[1].id));
    g.tratar(ana, { t: 'iniciar' });
    expect(ana.ultima('erro')?.msg).toMatch(/não está mais disponível/);
  });
});
