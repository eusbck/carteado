// Relatos de erro (botão "Reportar erro"): o pedido do cliente é conferido, o relato é gravado numa pasta própria com
// as imagens em arquivos, e a partida da sala só vai junto com o token de um assento, sem a senha nem os tokens, e
// dá para refazê-la pelas entradas.
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import { defaultAnswer } from '../motor/ask.ts';
import { Game, type Input } from '../motor/game.ts';
import type { DeckList } from '../motor/state.ts';
import type { Decision, GameConfig } from '../motor/types.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgCliente, MsgServidor } from '../servidor/protocolo.ts';
import { conferirPedido, MAX_IMAGENS, numeroCurto, Relatos } from '../servidor/relatos.ts';
import { Gerente, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';

const DECKS = decksJson as DeckList[];
// PNG de 1x1 pixel
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  msgs: MsgServidor[] = [];
  enviar(m: MsgServidor) { this.msgs.push(m); }
  ultima<T extends MsgServidor['t']>(t: T): Extract<MsgServidor, { t: T }> | undefined {
    for (let i = this.msgs.length - 1; i >= 0; i--) if (this.msgs[i].t === t) return this.msgs[i] as Extract<MsgServidor, { t: T }>;
    return undefined;
  }
}
const espera = () => new Promise((r) => setTimeout(r, 0));
const resposta = (d: Decision): MsgCliente => ({ t: 'responder', decisao: d.id, resposta: d.kind === 'payment' ? { kind: 'payment', auto: true } : d.kind === 'mulligan' ? { kind: 'mulligan', keep: true } : defaultAnswer(d) });

const pastas: string[] = [];
const pastaNova = () => { const p = mkdtempSync(join(tmpdir(), 'relatos-')); pastas.push(p); return p; };
afterAll(() => { for (const p of pastas) rmSync(p, { recursive: true, force: true }); });

const pedidoBase = (extra: Record<string, unknown> = {}) => ({ tipo: 'regra', oque: 'O raio não tirou vida', imagens: [], anexarPartida: false, contexto: { tela: 'sala' }, ...extra });

describe('relatos de erro: o pedido', () => {
  it('exige o texto do que aconteceu', () => {
    expect(conferirPedido(pedidoBase({ oque: '  ' }))).toEqual({ erro: 'Conte o que aconteceu' });
    expect(conferirPedido(null)).toEqual({ erro: 'Pedido inválido' });
  });

  it('aceita só imagens PNG, JPEG e WebP, até o limite', () => {
    expect('erro' in conferirPedido(pedidoBase({ imagens: [{ dados: 'data:image/svg+xml;base64,PHN2Zz4=', origem: 'anexo' }] }))).toBe(true);
    expect('erro' in conferirPedido(pedidoBase({ imagens: [{ dados: 'javascript:alert(1)', origem: 'anexo' }] }))).toBe(true);
    const muitas = Array.from({ length: MAX_IMAGENS + 1 }, () => ({ dados: PNG, origem: 'tela' }));
    expect(conferirPedido(pedidoBase({ imagens: muitas }))).toEqual({ erro: `No máximo ${MAX_IMAGENS} imagens` });
    const ok = conferirPedido(pedidoBase({ imagens: [{ dados: PNG, origem: 'tela' }, { dados: PNG, origem: 'qualquer', marcada: true, nome: 'x.png' }] }));
    if ('erro' in ok) throw new Error(ok.erro);
    expect(ok.imagens.map((i) => [i.tipo, i.origem, i.marcada])).toEqual([['image/png', 'tela', undefined], ['image/png', 'anexo', true]]);
  });

  it('limpa o resto: tipo desconhecido vira "outro", cartas sem repetir, sala só com código e token', () => {
    const c = conferirPedido(pedidoBase({ tipo: 'xyz', repete: 'talvez', cartas: ['Sol Ring', 'Sol Ring', '', 5], sala: { codigo: 'ABCD', token: 't' }, anexarPartida: true }));
    if ('erro' in c) throw new Error(c.erro);
    expect(c.pedido.tipo).toBe('outro');
    expect(c.pedido.repete).toBe('nao-sei');
    expect(c.pedido.cartas).toEqual(['Sol Ring']);
    expect(c.pedido.sala).toEqual({ codigo: 'ABCD', token: 't' });
    expect(c.pedido.anexarPartida).toBe(true);
  });
});

describe('relatos de erro: gravação', () => {
  it('cada relato numa pasta, com as imagens em arquivos e o número curto para achar', () => {
    const relatos = new Relatos(pastaNova());
    const c = conferirPedido(pedidoBase({ imagens: [{ dados: PNG, origem: 'tela' }], cartas: ['Lightning Bolt'], nome: 'Ana' }));
    if ('erro' in c) throw new Error(c.erro);
    const id = relatos.gravar(c.pedido, c.imagens, { partida: { entradas: [] } }, null, { versao: 'abc' });
    expect(id).toMatch(/^\d{8}-\d{6}-[a-z0-9]{4}$/);
    const arquivos = readdirSync(relatos.pastaDe(id)).sort();
    expect(arquivos).toEqual(['01-tela.png', 'partida.json', 'relato.json']);
    expect(readFileSync(join(relatos.pastaDe(id), '01-tela.png')).subarray(1, 4).toString()).toBe('PNG');
    const r = relatos.achar(numeroCurto(id).toLowerCase())!;
    expect(r).toMatchObject({ id, estado: 'aberto', oque: 'O raio não tirou vida', cartas: ['Lightning Bolt'], nome: 'Ana', partida: true, servidor: { versao: 'abc' } });
    expect(r.imagens).toEqual([{ arquivo: '01-tela.png', origem: 'tela', bytes: expect.any(Number) }]);
    relatos.marcar(id, 'resolvido', 'corrigido no motor');
    expect(relatos.listar()[0]).toMatchObject({ estado: 'resolvido', resolucao: { nota: 'corrigido no motor' } });
    // nenhuma pasta temporária sobra
    expect(readdirSync(relatos.pasta).filter((n) => n.startsWith('.'))).toEqual([]);
  });
});

describe('relatos de erro: a partida da sala', () => {
  it('só com o token de um assento; vai sem senha nem tokens; as entradas refazem a partida', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    g.sementeFixa = 'relato-1';
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo-da-sala', modo: '1v1' });
    const { codigo } = ana.ultima('sala')!.sala;
    const token = ana.ultima('sala')!.token;
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id });
    g.tratar(ana, { t: 'iniciar' });
    for (let i = 0; i < 12; i++) {
      await espera();
      const d = ana.ultima('jogo')?.vista.decision;
      if (d && d.player === 0) g.tratar(ana, resposta(d));
    }
    await espera();

    expect(g.paraRelato(codigo, 'token-errado')).toBeNull();
    expect(g.paraRelato('ZZZZ', token)).toBeNull();
    const p = g.paraRelato(codigo.toLowerCase(), token) as { voce: number; assentos: object[]; partida: { config: GameConfig; listas: DeckList[]; entradas: Input[] } };
    expect(p.voce).toBe(0);
    const texto = JSON.stringify(p);
    expect(texto).not.toContain('segredo-da-sala');
    expect(texto).not.toContain(token);
    expect(p.assentos.every((a) => !('token' in a))).toBe(true);
    expect(p.partida.entradas.length).toBeGreaterThan(0);

    // refeita do começo pelas entradas, a partida chega onde a sala está
    const sala = g.salas.get(codigo)!;
    const { game, erro } = Game.replayAteFalhar(p.partida.config, p.partida.listas, p.partida.entradas, null);
    expect(erro).toBeNull();
    expect(game.state.turn).toEqual(sala.game!.state.turn);
    expect(game.state.players.map((x) => x.life)).toEqual(sala.game!.state.players.map((x) => x.life));
    expect(game.inputs.length).toBe(sala.game!.inputs.length);
  }, 60000);
});
