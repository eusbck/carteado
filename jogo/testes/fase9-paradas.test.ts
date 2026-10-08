// Fase 9, item 1.1: o turno dos bots anda sozinho com as paradas padrão; a mesa só espera a pessoa onde ela marcou
// parada, e aí o aviso diz por quê (conexões falsas, banco em memória, sem atrasos).
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import { defaultAnswer } from '../motor/ask.ts';
import type { StopSettings } from '../motor/autopass.ts';
import type { DeckList } from '../motor/state.ts';
import type { Decision } from '../motor/types.ts';
import type { GameView } from '../motor/view.ts';
import { avisoPrioridade } from '../cliente/src/mesa/prioridade.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgCliente, MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, PARADAS_PADRAO, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';

const DECKS = decksJson as DeckList[];

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

const espera = (ms = 0) => new Promise((r) => setTimeout(r, ms));

function resposta(d: Decision): MsgCliente {
  const r = d.kind === 'payment' ? { kind: 'payment' as const, auto: true } : d.kind === 'mulligan' ? { kind: 'mulligan' as const, keep: true } : defaultAnswer(d);
  return { t: 'responder', decisao: d.id, resposta: r };
}

/** Ana (mesa real: para mesmo sem jogada) contra bots; devolve cada decisão de prioridade que chegou para ela */
async function jogar(modo: '1v1' | '4p', turnos: number, paradas?: Partial<StopSettings>, chegou?: (ps: { v: GameView; d: Decision }[]) => boolean) {
  const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
  const ana = new Falsa();
  g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo });
  g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
  const n = modo === '4p' ? 4 : 2;
  for (let i = 1; i < n; i++) g.tratar(ana, { t: 'bot', assento: i, deck: DECKS[(i * 2) % DECKS.length].id });
  const atuais = ana.ultima('jogo')?.paradas ?? PARADAS_PADRAO;
  g.tratar(ana, { t: 'paradas', paradas: { ...atuais, ...paradas, skipWhenNothing: false } });
  g.tratar(ana, { t: 'iniciar' });
  const prioridades: { v: GameView; d: Decision }[] = [];
  const vistas = new Set<number>();
  for (let k = 0; k < 40000; k++) {
    await espera();
    const v = ana.ultima('jogo')?.vista;
    if (!v || v.gameOver || v.turn.number > turnos) break;
    const d = v.decision;
    if (!d || vistas.has(d.id)) { await espera(1); continue; }
    vistas.add(d.id);
    if (d.kind === 'priority') prioridades.push({ v, d });
    if (chegou?.(prioridades)) break;
    g.tratar(ana, resposta(d));
  }
  return prioridades;
}

const noMeuTurnoNasParadas = ({ v }: { v: GameView }) => v.turn.active === v.you && v.stack.length === 0 && PARADAS_PADRAO.myTurn.includes(v.turn.step);

describe('fase 9: paradas padrão contra bots (1.1)', () => {
  it('1v1: no turno do bot a mesa não espera a pessoa; ela só para nas paradas do próprio turno', async () => {
    const ps = await jogar('1v1', 8);
    expect(ps.length).toBeGreaterThan(0);
    expect(ps.filter((p) => !noMeuTurnoNasParadas(p)).map(({ v }) => `${v.turn.number} ${v.turn.step}`)).toEqual([]);
  }, 180000);

  it('4 jogadores: idem, com três bots', async () => {
    const ps = await jogar('4p', 6);
    expect(ps.length).toBeGreaterThan(0);
    expect(ps.filter((p) => !noMeuTurnoNasParadas(p)).map(({ v }) => `${v.turn.number} ${v.turn.step}`)).toEqual([]);
  }, 240000);

  it('quem marca a etapa final dos outros e as mágicas dos oponentes para ali, e o aviso diz por quê', async () => {
    // (a semente da sala é sorteada: joga até ver as duas paradas, num limite folgado de turnos)
    const ps = await jogar('1v1', 30, { othersTurn: ['end'], stopOnOpponentStack: true }, (ps) => ps.filter(({ v }) => v.turn.active !== v.you && v.turn.step === 'end' && !v.stack.length).length > 2 && ps.some(({ v }) => v.stack.length > 0 && v.stack[0].controller !== v.you));
    const fim = ps.filter(({ v }) => v.turn.active !== v.you && v.turn.step === 'end' && v.stack.length === 0);
    expect(fim.length).toBeGreaterThan(2);
    const a = avisoPrioridade(fim[0].v, fim[0].v.you!, fim[0].d)!;
    const bot = fim[0].v.players[1].name;
    expect(`${a.texto}${a.destaque}${a.resto}`).toBe(`Turno de ${bot}, etapa final: sua vez de agir`);
    const pilha = ps.filter(({ v }) => v.stack.length > 0 && v.stack[0].controller !== v.you);
    expect(pilha.length).toBeGreaterThan(0);
    const b = avisoPrioridade(pilha[0].v, pilha[0].v.you!, pilha[0].d)!;
    expect(b.texto).toBe('Sua vez de responder a ');
    expect(b.destaque).toBe(pilha[0].v.stack[0].kind === 'spell' ? pilha[0].v.stack[0].name : `habilidade de ${pilha[0].v.stack[0].name}`);
    expect(b.resto).toBe(` de ${bot}`);
    // no próprio turno, com a pilha vazia, é a prioridade normal: sem aviso
    const meu = ps.find(noMeuTurnoNasParadas)!;
    expect(avisoPrioridade(meu.v, meu.v.you!, meu.d)).toBeNull();
  }, 180000);

  it('salas antigas com as paradas padrão de antes passam para as novas ao reiniciar; as escolhidas ficam', () => {
    const banco = new Banco(':memory:');
    const g = new Gerente(banco, DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    const s = g.salas.get(codigo)!;
    s.d.assentos[0].paradas = { myTurn: ['main1', 'beginCombat', 'main2'], othersTurn: ['end'], stopOnOpponentStack: true, stopOnOwnStack: false, passUntilTurnEnds: null, skipWhenNothing: false };
    s.d.assentos[1].paradas = { myTurn: ['main1'], othersTurn: ['end'], stopOnOpponentStack: true, stopOnOwnStack: false, passUntilTurnEnds: null };
    s.salvar();
    const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
    g2.restaurar();
    const [a0, a1] = g2.salas.get(codigo)!.d.assentos;
    expect(a0.paradas).toEqual({ ...PARADAS_PADRAO, skipWhenNothing: false });
    expect(a1.paradas.othersTurn).toEqual(['end']);
  });
});
