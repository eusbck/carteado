// Onda B (registro R2 e R8) no servidor: a partida da sala liga o redator (compras etc. no registro) e a sala guarda as
// linhas de sistema (queda e volta de quem joga, desfazer), mandadas na mensagem 'sistema' (conexões falsas, banco em
// memória, sem atrasos).
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import type { DeckList } from '../motor/state.ts';
import { Banco } from '../servidor/banco.ts';
import type { LinhaSistema, MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';

const DECKS = decksJson as DeckList[];

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  msgs: MsgServidor[] = [];
  enviar(m: MsgServidor) { this.msgs.push(m); }
  ultima<T extends MsgServidor['t']>(t: T): Extract<MsgServidor, { t: T }> | undefined {
    return [...this.msgs].reverse().find((m) => m.t === t) as Extract<MsgServidor, { t: T }> | undefined;
  }
  /** as linhas de sistema como o cliente as junta (loja.ts) */
  get sistema(): LinhaSistema[] {
    let l: LinhaSistema[] = [];
    for (const m of this.msgs) {
      if (m.t !== 'sistema') continue;
      if (m.tudo) l = m.linhas; else l = [...l, ...m.linhas.filter((x) => !l.some((y) => y.id === x.id))];
    }
    return l;
  }
}

const espera = (ms = 0) => new Promise((r) => setTimeout(r, ms));

function sala() {
  const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
  g.sementeFixa = 'registro-sistema';
  const ana = new Falsa();
  g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
  const codigo = ana.ultima('sala')!.sala.codigo;
  const bruno = new Falsa();
  g.tratar(bruno, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Bruno' });
  g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
  g.tratar(bruno, { t: 'deck', deck: DECKS[1].id });
  return { g, ana, bruno, codigo };
}

describe('registro: linhas de sistema da sala', () => {
  it('no saguão nada entra; com a partida, a queda e a volta logo depois viram uma linha só', async () => {
    const { g, ana, bruno, codigo } = sala();
    const token = bruno.ultima('sala')!.token;
    expect(ana.sistema).toEqual([]);
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    g.desconectar(bruno);
    expect(ana.sistema.map((l) => [l.tipo, l.texto, l.quem])).toEqual([['saiu', 'Bruno perdeu a conexão.', 1]]);
    expect(ana.sistema[0].apos).toBe(ana.ultima('jogo')!.vista.log.at(-1)!.seq);
    const volta = new Falsa();
    g.tratar(volta, { t: 'retomar', codigo, token });
    expect(ana.sistema.map((l) => [l.tipo, l.texto])).toEqual([['voltou', 'Bruno caiu e voltou.']]);
    // quem volta recebe a lista inteira
    expect(volta.sistema.map((l) => l.texto)).toEqual(['Bruno caiu e voltou.']);
    // uma segunda aba no mesmo assento não é volta
    const aba = new Falsa();
    g.tratar(aba, { t: 'retomar', codigo, token });
    expect(ana.sistema).toHaveLength(1);
    // cai de novo (as duas abas) e volta logo: a mesma linha ganha a conta
    g.desconectar(aba);
    g.desconectar(volta);
    g.tratar(new Falsa(), { t: 'retomar', codigo, token });
    expect(ana.sistema.map((l) => l.texto)).toEqual(['Bruno caiu e voltou (2 vezes).']);
  });

  it('a partida da sala liga o registro detalhado: as compras aparecem, com a contagem para o outro', async () => {
    const { g, ana, bruno } = sala();
    g.tratar(ana, { t: 'iniciar' });
    // as duas pessoas ficam com a mão e passam até alguém comprar no turno
    for (let k = 0; k < 400; k++) {
      await espera();
      const v = ana.ultima('jogo')?.vista;
      if (v?.log.some((l) => l.kind === 'compra')) break;
      for (const p of [ana, bruno]) {
        const d = p.ultima('jogo')?.vista.decision;
        if (!d) continue;
        if (d.kind === 'mulligan') g.tratar(p, { t: 'responder', decisao: d.id, resposta: { kind: 'mulligan', keep: true } });
        else if (d.kind === 'priority') g.tratar(p, { t: 'responder', decisao: d.id, resposta: { kind: 'priority', action: 'pass' } });
      }
    }
    const daAna = ana.ultima('jogo')!.vista.log.filter((l) => l.kind === 'compra');
    const doBruno = bruno.ultima('jogo')!.vista.log.filter((l) => l.kind === 'compra');
    expect(daAna.length).toBeGreaterThan(0);
    // a mesma linha: quem comprou vê as cartas; o outro, "compra 1 carta."
    const seq = daAna[0].seq;
    const [a, b] = [daAna[0], doBruno.find((l) => l.seq === seq)!];
    const quem = a.actor!;
    const [dele, outro] = quem === 0 ? [a, b] : [b, a];
    expect(outro.text).toMatch(/^(Ana|Bruno) compra 1 carta\.$/);
    expect(outro.refs).toBeUndefined();
    expect(dele.refs!.some((r) => r.k === 'obj' && r.def)).toBe(true);
  });
});
