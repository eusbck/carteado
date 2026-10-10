// Partida completa no servidor (sem rede): uma pessoa (simulada, respondendo pela vista que recebe) e 3 bots
// heurísticos com a força de verdade. Confere que a sala chega ao fim sem erro do motor e que a vista da pessoa
// nunca mostra a mão dos outros.
// Uso: node ferramentas/humano-e-bots.ts [semente] [modo: 4p|1v1] [níveis dos bots, ex.: magicgod,cartomante,dificil]
// Os bots pensam nas threads de pensar, como no servidor de verdade (fase 9).
import '../cartas/index.ts';
import { readFileSync } from 'node:fs';
import { RandomBot } from '../bots/aleatorio.ts';
import type { NivelBot } from '../bots/niveis.ts';
import { defaultAnswer } from '../motor/ask.ts';
import type { DeckList } from '../motor/state.ts';
import type { Answer, Decision } from '../motor/types.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgServidor } from '../servidor/protocolo.ts';
import { ATRASOS_PADRAO, Gerente, PARADAS_PADRAO, type Conexao } from '../servidor/salas.ts';

const DECKS = JSON.parse(readFileSync(new URL('../gerado/decks.json', import.meta.url), 'utf8')) as DeckList[];
const semente = process.argv[2] ?? 'humano';
const modo = (process.argv[3] ?? '4p') as '4p' | '1v1';
const niveis = (process.argv[4] ?? 'intermediario').split(',') as NivelBot[];

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
// senha da sala conferida na hora (no servidor o scrypt é assíncrono e a sala chegaria depois desta linha)
const g = new Gerente(new Banco(':memory:'), DECKS, { ...ATRASOS_PADRAO, botAcao: 0, botPasse: 0, autoPasse: 0, senhaNaHora: true });
const ana = new Pessoa();
g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo });
const codigo = ana.ultima('sala')!.sala.codigo;
g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
const n = modo === '4p' ? 4 : 2;
for (let i = 1; i < n; i++) g.tratar(ana, { t: 'bot', assento: i, deck: DECKS[(i * 2) % DECKS.length].id, nivel: niveis[(i - 1) % niveis.length] });
// mesa real (fase 8): a pessoa para nas paradas mesmo sem jogada; as paradas são as padrão de quem senta
{ const p = ana.ultima('jogo')?.paradas ?? PARADAS_PADRAO; g.tratar(ana, { t: 'paradas', paradas: { ...p, skipWhenNothing: false } }); }
g.tratar(ana, { t: 'iniciar' });

const pessoa = new RandomBot(`pessoa:${semente}`);
const t0 = Date.now();
// medição (fase 9, item 4.5): processador do processo inteiro (linha principal + threads de pensar) e memória
const cpu0 = process.cpuUsage();
let picoRss = 0;
/** memória do processo ao longo da partida (para ver se cresce) */
const rss: number[] = [];
const amostra = setInterval(() => { const m = process.memoryUsage().rss; picoRss = Math.max(picoRss, m); rss.push(m); }, 500);
amostra.unref();
let respondidas = 0;
let ultimaId = -1;
let vazamentos = 0;
let ultimaQtd = 0;
let paradas = 0;
/** fase 9 (1.1): com as paradas padrão, a mesa não pode esperar Ana no turno dos bots (cliques extras), a não ser na
 *  parada inteligente (09/10): com jogada instantânea, na mágica de um bot, no ataque e na etapa final dele */
let cliquesExtras = 0;
let paradasInteligentes = 0;
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
  if (d.kind === 'priority' && v.turn.active !== v.you) {
    const jogada = d.actions.some((a) => a.kind !== 'pass' && a.kind !== 'mana' && a.kind !== 'manual');
    const momento = v.stack.length > 0 ? v.stack[0].controller !== v.you : (v.turn.step === 'declareAttackers' && !!v.combat?.attackers.length) || v.turn.step === 'end';
    if (jogada && momento) paradasInteligentes++;
    else { cliquesExtras++; console.log(`clique extra: turno ${v.turn.number} (${v.players[v.turn.active].name}), ${v.turn.step}, pilha ${v.stack.length}`); }
  }
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
{
  const cpu = process.cpuUsage(cpu0);
  const seg = (Date.now() - t0) / 1000;
  const nucleos = (await import('node:os')).availableParallelism();
  const quarto = (q: number) => { const l = rss.slice(Math.floor(rss.length * q / 4), Math.floor(rss.length * (q + 1) / 4)); return l.length ? l.reduce((t, x) => t + x, 0) / l.length / 2 ** 20 : 0; };
  console.log(`memória do processo por quarto da partida (média): ${[0, 1, 2, 3].map((q) => `${quarto(q).toFixed(0)} MB`).join(' → ')}`);
  console.log(`processador: ${((cpu.user + cpu.system) / 1e6 / seg * 100).toFixed(0)}% de uma thread em média (${((cpu.user + cpu.system) / 1e6 / seg / nucleos * 100).toFixed(1)}% das ${nucleos} threads); pico de memória do processo ${(picoRss / 2 ** 20).toFixed(0)} MB; pico do heap das threads de pensar ${((g.pensadores?.picoMemoria ?? 0) / 2 ** 20).toFixed(0)} MB`);
  for (const [nv, e] of Object.entries(g.pensadores?.estatisticas ?? {})) console.log(`  ${nv}: ${e.n} decisões pensadas, média ${(e.soma / e.n).toFixed(0)} ms, máximo ${e.max.toFixed(0)} ms; espera na fila média ${(e.espera / e.n).toFixed(0)} ms, máxima ${e.esperaMax.toFixed(0)} ms`);
}
console.log(`${modo}: fim no turno ${v.turn.number} — ${v.gameOver?.draw ? 'empate' : `vencedor ${v.gameOver?.winners.join(',')}`} (${v.gameOver?.reason}); ${respondidas} decisões de Ana; ${((Date.now() - t0) / 1000).toFixed(1)} s; vazamentos: ${vazamentos}; cliques extras no turno dos bots: ${cliquesExtras}; paradas inteligentes: ${paradasInteligentes}`);
process.exit(v.gameOver && vazamentos === 0 && cliquesExtras === 0 ? 0 : 1);
