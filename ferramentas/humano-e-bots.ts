// Partida completa no servidor (sem rede): uma pessoa (simulada, respondendo pela vista que recebe) e 3 bots
// heurísticos com a força de verdade. Confere que a sala chega ao fim sem erro do motor e que a vista da pessoa
// nunca mostra a mão dos outros.
// Uso: node ferramentas/humano-e-bots.ts [semente] [modo: 4p|1v1]
import '../cartas/index.ts';
import { readFileSync } from 'node:fs';
import { RandomBot } from '../bots/aleatorio.ts';
import { defaultAnswer } from '../motor/ask.ts';
import type { DeckList } from '../motor/state.ts';
import type { Answer, Decision } from '../motor/types.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgServidor } from '../servidor/protocolo.ts';
import { ATRASOS_PADRAO, Gerente, type Conexao } from '../servidor/salas.ts';

const DECKS = JSON.parse(readFileSync(new URL('../gerado/decks.json', import.meta.url), 'utf8')) as DeckList[];
const semente = process.argv[2] ?? 'humano';
const modo = (process.argv[3] ?? '4p') as '4p' | '1v1';

class Pessoa implements Conexao {
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
const g = new Gerente(new Banco(':memory:'), DECKS, { ...ATRASOS_PADRAO, botAcao: 0, botPasse: 0, autoPasse: 0 });
const ana = new Pessoa();
g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo });
const codigo = ana.ultima('sala')!.sala.codigo;
g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
const n = modo === '4p' ? 4 : 2;
for (let i = 1; i < n; i++) g.tratar(ana, { t: 'bot', assento: i, deck: DECKS[(i * 2) % DECKS.length].id });
g.tratar(ana, { t: 'iniciar' });

const pessoa = new RandomBot(`pessoa:${semente}`);
const t0 = Date.now();
let respondidas = 0;
let ultimaId = -1;
let vazamentos = 0;
let ultimaQtd = 0;
let paradas = 0;
for (let volta = 0; volta < 2000000; volta++) {
  await espera();
  // travamento: nada novo chega para Ana por muito tempo
  if (ana.msgs.length === ultimaQtd) paradas++; else { paradas = 0; ultimaQtd = ana.msgs.length; }
  if (paradas > 5000) {
    const sala = g.salas.get(codigo)!;
    const jogo = (sala as unknown as { game: { pending: Decision | null; state: { turn: unknown; log: { text: string }[]; players: unknown[] } } | null }).game;
    console.log('TRAVOU: pendente', JSON.stringify(jogo?.pending)?.slice(0, 400));
    console.log('turno', JSON.stringify(jogo?.state.turn), 'erro', sala.erro);
    console.log('vista de Ana: decisão', JSON.stringify(ana.ultima('jogo')?.vista.decision)?.slice(0, 300));
    console.log('últimas mensagens', ana.msgs.slice(-3).map((m) => m.t).join(','));
    for (const l of jogo?.state.log.slice(-8) ?? []) console.log(l.text);
    process.exit(1);
  }
  const sala = g.salas.get(codigo)!;
  if (sala.erro) { console.log('ERRO DO MOTOR:', sala.erro); process.exit(1); }
  const v = ana.ultima('jogo')?.vista;
  if (!v) continue;
  if (v.gameOver) break;
  // a vista de Ana não pode ter cartas das mãos dos outros
  for (const o of v.hand) if ((o as unknown as { owner?: number }).owner !== undefined && (o as unknown as { owner: number }).owner !== 0) vazamentos++;
  const d = v.decision as Decision | null;
  if (!d || d.id === ultimaId) continue;
  ultimaId = d.id;
  const antes = ana.msgs.length;
  let resposta: Answer = pessoa.answer(d);
  g.tratar(ana, { t: 'responder', decisao: d.id, resposta });
  // resposta recusada (a pessoa errou): tenta a neutra, como alguém que corrige a jogada
  if (ana.msgs.slice(antes).some((m) => m.t === 'erro')) {
    resposta = defaultAnswer(d);
    ultimaId = -1;
    g.tratar(ana, { t: 'responder', decisao: d.id, resposta });
  }
  respondidas++;
}
const v = ana.ultima('jogo')!.vista;
console.log(`${modo}: fim no turno ${v.turn.number} — ${v.gameOver?.draw ? 'empate' : `vencedor ${v.gameOver?.winners.join(',')}`} (${v.gameOver?.reason}); ${respondidas} decisões de Ana; ${((Date.now() - t0) / 1000).toFixed(1)} s; vazamentos: ${vazamentos}`);
process.exit(v.gameOver && vazamentos === 0 ? 0 : 1);
