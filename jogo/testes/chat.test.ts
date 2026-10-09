// Chat da sala no servidor, sem rede (conexões falsas e banco em memória): entrega a todos, conversa
// guardada para quem entra ou volta, texto limpo, limite de ritmo e o que fica depois de reiniciar.
import { afterEach, describe, expect, it, vi } from 'vitest';
import decksJson from './decks-teste.json' with { type: 'json' };
import type { DeckList } from '../motor/state.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgChat, MsgServidor } from '../servidor/protocolo.ts';
import { CHAT_TAMANHO, Gerente, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';

const DECKS = decksJson as DeckList[];

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  msgs: MsgServidor[] = [];
  enviar(m: MsgServidor) { this.msgs.push(m); }
  ultima<T extends MsgServidor['t']>(t: T): Extract<MsgServidor, { t: T }> | undefined {
    return [...this.msgs].reverse().find((m) => m.t === t) as Extract<MsgServidor, { t: T }> | undefined;
  }
  /** a conversa como o cliente monta: a guardada (tudo) e as novas depois dela */
  conversa(): MsgChat[] {
    let lista: MsgChat[] = [];
    for (const m of this.msgs) if (m.t === 'chat') lista = m.tudo ? [...m.msgs] : [...lista, ...m.msgs];
    return lista;
  }
}

function sala(banco = new Banco(':memory:')) {
  const g = new Gerente(banco, DECKS, SEM_ATRASO);
  const ana = new Falsa();
  g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '4p' });
  const codigo = ana.ultima('sala')!.sala.codigo;
  const bruno = new Falsa();
  g.tratar(bruno, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Bruno' });
  return { g, banco, ana, bruno, codigo };
}

afterEach(() => { vi.useRealTimers(); });

describe('chat da sala', () => {
  it('chega a todos da sala com o nome e o assento; quem entra depois recebe a conversa guardada', () => {
    const { g, ana, bruno, codigo } = sala();
    // ao entrar, cada um recebe a conversa (vazia)
    expect(ana.msgs.find((m) => m.t === 'chat')).toEqual({ t: 'chat', msgs: [], tudo: true });
    g.tratar(ana, { t: 'chat', texto: 'oi, mesa' });
    g.tratar(bruno, { t: 'chat', texto: 'boa noite' });
    for (const p of [ana, bruno]) expect(p.conversa().map((m) => [m.de, m.nome, m.texto])).toEqual([[0, 'Ana', 'oi, mesa'], [1, 'Bruno', 'boa noite']]);
    expect(ana.conversa().map((m) => m.id)).toEqual([1, 2]);
    // outra sala não recebe nada
    const outra = new Falsa();
    g.tratar(outra, { t: 'criar', nome: 'Davi', senhaSala: 'outra', modo: '1v1' });
    expect(outra.conversa()).toEqual([]);
    const carla = new Falsa();
    g.tratar(carla, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Carla' });
    expect(carla.ultima('chat')).toMatchObject({ tudo: true });
    expect(carla.conversa().map((m) => m.texto)).toEqual(['oi, mesa', 'boa noite']);
  });

  it('texto limpo: vazio não sai, quebras viram espaço e o que passa do limite é cortado', () => {
    const { g, ana, bruno } = sala();
    g.tratar(ana, { t: 'chat', texto: '   \n\t ' });
    g.tratar(ana, { t: 'chat', texto: 42 as unknown as string });
    expect(bruno.conversa()).toEqual([]);
    expect(ana.ultima('erro')).toBeUndefined();
    g.tratar(ana, { t: 'chat', texto: '  linha 1\r\nlinha\u00002  ' });
    g.tratar(ana, { t: 'chat', texto: 'x'.repeat(CHAT_TAMANHO + 50) });
    const [a, b] = bruno.conversa();
    expect(a.texto).toBe('linha 1 linha 2');
    expect(b.texto).toHaveLength(CHAT_TAMANHO);
  });

  it('limite de ritmo: a sexta mensagem em 5 segundos é recusada, e depois volta a valer', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-08T21:00:00Z'));
    const { g, ana, bruno } = sala();
    for (let i = 1; i <= 6; i++) g.tratar(ana, { t: 'chat', texto: `msg ${i}` });
    expect(bruno.conversa()).toHaveLength(5);
    expect(ana.ultima('erro')?.msg).toMatch(/Muitas mensagens/);
    // o limite é de cada um
    g.tratar(bruno, { t: 'chat', texto: 'eu posso' });
    expect(ana.conversa().at(-1)?.texto).toBe('eu posso');
    vi.setSystemTime(new Date('2026-10-08T21:00:06Z'));
    g.tratar(ana, { t: 'chat', texto: 'de novo' });
    expect(bruno.conversa().at(-1)?.texto).toBe('de novo');
  });

  it('guarda só as últimas 200 mensagens', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    let t = Date.parse('2026-10-08T21:00:00Z');
    const { g, ana, codigo } = sala();
    for (let i = 1; i <= 205; i++) { vi.setSystemTime(t += 2000); g.tratar(ana, { t: 'chat', texto: `msg ${i}` }); }
    const s = g.salas.get(codigo)!;
    expect(s.d.chat).toHaveLength(200);
    expect(s.d.chat![0].texto).toBe('msg 6');
    expect(s.d.chat!.at(-1)!.id).toBe(205);
  });

  it('a conversa sobrevive a reiniciar o servidor e volta para quem retoma pelo token', () => {
    const { g, banco, ana, bruno, codigo } = sala();
    g.tratar(ana, { t: 'chat', texto: 'antes de cair' });
    g.tratar(bruno, { t: 'chat', texto: 'tô aqui' });
    const token = bruno.ultima('sala')!.token;
    const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
    g2.restaurar();
    const volta = new Falsa();
    g2.tratar(volta, { t: 'retomar', codigo, token });
    expect(volta.ultima('chat')).toMatchObject({ tudo: true });
    expect(volta.conversa().map((m) => [m.nome, m.texto])).toEqual([['Ana', 'antes de cair'], ['Bruno', 'tô aqui']]);
    // e continua numerando de onde parou
    g2.tratar(volta, { t: 'chat', texto: 'voltei' });
    expect(volta.conversa().at(-1)).toMatchObject({ id: 3, de: 1, texto: 'voltei' });
  });

  it('cada mensagem leva o id de autor de quem estava no assento; outra pessoa no mesmo assento tem outro', () => {
    const { g, ana, bruno, codigo } = sala();
    const idBruno = bruno.ultima('sala')!.quem;
    expect(idBruno).toMatch(/^[\w-]{12}$/);
    expect(idBruno).not.toBe(ana.ultima('sala')!.quem);
    // o id não entrega o token
    expect(idBruno).not.toBe(bruno.ultima('sala')!.token.slice(0, 12));
    g.tratar(bruno, { t: 'chat', texto: 'sou o Bruno' });
    expect(ana.conversa().at(-1)).toMatchObject({ de: 1, quem: idBruno, nome: 'Bruno' });
    // quem volta pelo token continua com o mesmo id
    const volta = new Falsa();
    g.tratar(volta, { t: 'retomar', codigo, token: bruno.ultima('sala')!.token });
    expect(volta.ultima('sala')!.quem).toBe(idBruno);
    g.tratar(volta, { t: 'sair' });
    const carla = new Falsa();
    g.tratar(carla, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Carla' });
    expect(carla.ultima('sala')!.voce).toBe(1);
    const idCarla = carla.ultima('sala')!.quem;
    expect(idCarla).not.toBe(idBruno);
    g.tratar(carla, { t: 'chat', texto: 'agora sou eu' });
    expect(ana.conversa().map((m) => [m.de, m.quem, m.nome])).toEqual([[1, idBruno, 'Bruno'], [1, idCarla, 'Carla']]);
  });

  it('depois de uma partida encerrada, quem senta no assento escreve com o próprio nome', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    const bruno = new Falsa();
    g.tratar(bruno, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Bruno' });
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(bruno, { t: 'deck', deck: DECKS[1].id });
    g.tratar(ana, { t: 'iniciar' });
    await new Promise((r) => setTimeout(r, 0));
    g.tratar(bruno, { t: 'conceder' });
    await new Promise((r) => setTimeout(r, 0));
    expect(g.salas.get(codigo)!.game!.isOver()).toBe(true);
    g.tratar(bruno, { t: 'sair' });
    const carla = new Falsa();
    g.tratar(carla, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Carla' });
    expect(carla.ultima('sala')!.voce).toBe(1);
    g.tratar(carla, { t: 'chat', texto: 'oi' });
    expect(ana.conversa().at(-1)).toMatchObject({ de: 1, nome: 'Carla', quem: carla.ultima('sala')!.quem });
  });

  it('mensagens gravadas antes do id de autor voltam sem autor depois de reiniciar', () => {
    const { g, banco, ana, codigo } = sala();
    g.tratar(ana, { t: 'chat', texto: 'antiga' });
    const s = g.salas.get(codigo)!;
    delete (s.d.chat![0] as Partial<MsgChat>).quem;
    s.salvar();
    const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
    g2.restaurar();
    const volta = new Falsa();
    g2.tratar(volta, { t: 'retomar', codigo, token: ana.ultima('sala')!.token });
    expect(volta.conversa()).toMatchObject([{ texto: 'antiga', quem: '' }]);
  });

  it('fora de uma sala não dá para escrever', () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const solta = new Falsa();
    g.tratar(solta, { t: 'chat', texto: 'alguém?' });
    expect(solta.ultima('erro')?.msg).toMatch(/Entre numa sala/);
    expect(solta.conversa()).toEqual([]);
  });
});
