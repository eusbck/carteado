// Robustez e protocolo do servidor, sem rede (conexões falsas e banco em memória):
//  - batimento: `ping` responde `pong` com ou sem sala, sem gravar nada e fora do limite do chat;
//  - todo erro em resposta a uma mensagem diz de que tipo ela era (`de`);
//  - a semente fica no servidor: a sala só mostra um hash curto dela (`partida`).
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import type { DeckList } from '../motor/state.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, SEM_ATRASO, idPartida, type Conexao } from '../servidor/salas.ts';

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

/** banco que conta as gravações de sala */
class BancoContado extends Banco {
  gravacoes = 0;
  override salvarSala(codigo: string, dados: unknown): void { this.gravacoes++; super.salvarSala(codigo, dados); }
}

/** sala 1v1 de Ana (assento 0) com um bot no assento 1 */
function salaComBot(banco: Banco = new Banco(':memory:')) {
  const g = new Gerente(banco, DECKS, SEM_ATRASO);
  const ana = new Falsa();
  g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
  const codigo = ana.ultima('sala')!.sala.codigo;
  g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
  g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id });
  return { g, ana, codigo };
}

describe('protocolo: batimento e origem dos erros', () => {
  it('ping responde pong só a quem mandou, antes de entrar numa sala e dentro dela, sem gravar nada', () => {
    const banco = new BancoContado(':memory:');
    const g = new Gerente(banco, DECKS, SEM_ATRASO);
    const solta = new Falsa();
    g.tratar(solta, { t: 'ping' });
    expect(solta.msgs).toEqual([{ t: 'pong' }]);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
    const bruno = new Falsa();
    g.tratar(bruno, { t: 'entrar', codigo: ana.ultima('sala')!.sala.codigo, senhaSala: 'segredo', nome: 'Bruno' });
    const gravadas = banco.gravacoes;
    const n = bruno.msgs.length;
    // muitos seguidos: nenhum esbarra no limite de ritmo do chat
    for (let i = 0; i < 20; i++) g.tratar(ana, { t: 'ping' });
    expect(ana.msgs.filter((m) => m.t === 'pong')).toHaveLength(20);
    expect(ana.msgs.some((m) => m.t === 'erro')).toBe(false);
    expect(bruno.msgs.length).toBe(n);
    expect(banco.gravacoes).toBe(gravadas);
    // e o chat continua com o limite inteiro
    for (let i = 0; i < 5; i++) g.tratar(ana, { t: 'chat', texto: `oi ${i}` });
    expect(ana.ultima('erro')).toBeUndefined();
  });

  it('o erro diz o tipo da mensagem que o causou', async () => {
    const { g, ana } = salaComBot();
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    const d = ana.ultima('jogo')!.vista.decision!;
    g.tratar(ana, { t: 'responder', decisao: d.id + 5, resposta: { kind: 'mulligan', keep: true } });
    expect(ana.ultima('erro')).toMatchObject({ de: 'responder', msg: expect.stringMatching(/já passou/) });
    g.tratar(ana, { t: 'posicao', obj: 1, x: 7, y: 0 });
    expect(ana.ultima('erro')?.de).toBe('posicao');
    for (let i = 0; i < 6; i++) g.tratar(ana, { t: 'chat', texto: 'oi' });
    expect(ana.ultima('erro')).toMatchObject({ de: 'chat', msg: expect.stringMatching(/Muitas mensagens/) });
    const solta = new Falsa();
    g.tratar(solta, { t: 'conceder' });
    expect(solta.ultima('erro')).toMatchObject({ de: 'conceder', msg: expect.stringMatching(/Entre numa sala/) });
  });
});

describe('informação oculta: semente', () => {
  it('a sala mostra só um hash curto da semente; ninguém recebe a semente', async () => {
    const { g, ana, codigo } = salaComBot();
    expect(ana.ultima('sala')!.sala.partida).toBeNull();
    g.tratar(ana, { t: 'iniciar' });
    await espera();
    const semente = g.salas.get(codigo)!.d.partida!.config.seed;
    const pub = ana.ultima('sala')!.sala;
    expect(pub.partida).toBe(idPartida(semente));
    expect(pub.partida).toMatch(/^[0-9a-f]{12}$/);
    expect('semente' in pub).toBe(false);
    // em nenhuma mensagem, nem pedaço dela (a parte sorteada)
    const sorteada = semente.split('-').at(-1)!;
    expect(sorteada.length).toBeGreaterThanOrEqual(16);
    expect(JSON.stringify(ana.msgs)).not.toContain(sorteada);
  });
});
