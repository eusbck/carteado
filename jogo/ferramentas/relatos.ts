// Os relatos de erro que as pessoas mandam pelo botão "Reportar erro" (gravados pelo servidor em
// dados-locais/relatos/<id>/). Uso:
//   node ferramentas/relatos.ts listar [--todos]        os abertos (com --todos, os resolvidos também)
//   node ferramentas/relatos.ts ver <número>            tudo o que veio: texto, imagens, mesa, erros, ações
//   node ferramentas/relatos.ts reproduzir <número> [--ate N]
//        refaz a partida pelas entradas gravadas com o motor de agora e compara com a mesa que a pessoa via; grava a
//        vista refeita em reproducao-vista.json, na pasta do relato
//   node ferramentas/relatos.ts resolver <número> [nota]   marca como resolvido (reabrir <número> desfaz)
// <número> é o código curto que a pessoa recebeu (as 4 letras do fim do id) ou o id inteiro.
// A pasta dos relatos: RELATOS, ou DADOS/relatos, ou jogo/dados-locais/relatos.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import '../cartas/index.ts';
import { Game, type Checkpoint, type Input } from '../motor/game.ts';
import type { DeckList } from '../motor/state.ts';
import type { GameConfig } from '../motor/types.ts';
import { buildView, type GameView } from '../motor/view.ts';
import { numeroCurto, Relatos, type RelatoGravado } from '../servidor/relatos.ts';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PASTA = process.env.RELATOS ?? join(process.env.DADOS ?? join(RAIZ, 'dados-locais'), 'relatos');
const relatos = new Relatos(PASTA);

const TIPOS: Record<string, string> = { regra: 'carta/regra', visual: 'visual', travou: 'travou/erro', bot: 'bot', outro: 'outro' };
const REPETE: Record<string, string> = { sempre: 'sempre', 'as-vezes': 'às vezes', 'uma-vez': 'uma vez', 'nao-sei': 'não sabe' };

const data = (iso: string) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const linha = (s: string, n: number) => { const l = s.replace(/\s+/g, ' ').trim(); return l.length > n ? `${l.slice(0, n - 1)}…` : l; };
const titulo = (t: string) => console.log(`\n== ${t} ${'='.repeat(Math.max(0, 70 - t.length))}`);

function achar(parte: string | undefined): RelatoGravado {
  if (!parte) { console.error('Diga o número do relato (veja: node ferramentas/relatos.ts listar)'); process.exit(1); }
  const r = relatos.achar(parte.toLowerCase());
  if (!r) { console.error(`Relato "${parte}" não encontrado em ${PASTA}`); process.exit(1); }
  return r;
}

function versaoAgora(): string | null {
  try { return execFileSync('git', ['log', '-1', '--format=%h %cI %s'], { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; }
}

function listar(todos: boolean): void {
  const l = relatos.listar().filter((r) => todos || r.estado === 'aberto');
  if (!l.length) { console.log(todos ? `Nenhum relato em ${PASTA}` : 'Nenhum relato aberto (use --todos para ver os resolvidos)'); return; }
  for (const r of l) {
    const marcas = [`${r.imagens.length} img`, r.partida ? 'partida' : null, r.estado === 'resolvido' ? 'RESOLVIDO' : null].filter(Boolean).join(', ');
    console.log(`${numeroCurto(r.id)}  ${data(r.em).padEnd(17)} ${(TIPOS[r.tipo] ?? r.tipo).padEnd(12)} ${(r.nome || '?').slice(0, 14).padEnd(14)} ${linha(r.oque, 70)}  [${marcas}]`);
  }
  console.log(`\n${l.length} relato(s) em ${PASTA}. Detalhes: node ferramentas/relatos.ts ver <número>`);
}

type Ocorrencia = { em: string; tipo: string; texto: string };

function ver(r: RelatoGravado): void {
  const pasta = relatos.pastaDe(r.id);
  const c = r.contexto as Record<string, any>;
  console.log(`Relato ${numeroCurto(r.id)} (${r.id}) · ${data(r.em)} · ${r.estado}${r.resolucao ? ` em ${data(r.resolucao.em)}: ${r.resolucao.nota}` : ''}`);
  console.log(`De: ${r.nome || '(sem nome)'} · tipo: ${TIPOS[r.tipo] ?? r.tipo} · repete: ${REPETE[r.repete] ?? r.repete}`);
  titulo('O que aconteceu');
  console.log(r.oque);
  if (r.esperado) { titulo('O que esperava'); console.log(r.esperado); }
  if (r.passos) { titulo('O que fez antes'); console.log(r.passos); }
  if (r.cartas.length) { titulo('Cartas'); console.log(r.cartas.join(' · ')); }
  titulo('Imagens');
  if (!r.imagens.length) console.log('(nenhuma)');
  for (const im of r.imagens) console.log(`${join(pasta, im.arquivo)}  (${im.origem}${im.nome ? `: ${im.nome}` : ''}${im.marcada ? ', marcada' : ''}, ${Math.round(im.bytes / 1024)} KB)`);

  titulo('Onde');
  console.log(`Tela: ${c.tela} · conectado: ${c.conectado} · ${c.janela?.largura}x${c.janela?.altura} (densidade ${c.janela?.densidade}) · ${c.toque ? 'toque' : 'mouse'}`);
  console.log(`Navegador: ${c.navegador}`);
  if (c.sala) console.log(`Sala ${c.sala.codigo} (${c.sala.estado}) · você: assento ${c.voce} · ${c.sala.assentos?.map((a: any) => `${a.nome ?? '-'}${a.tipo === 'bot' ? ' (bot)' : ''}`).join(', ')}`);
  console.log(`Partida junto: ${r.partida ? `sim (${join(pasta, 'partida.json')})` : `não${r.partidaAusente ? ` — ${r.partidaAusente}` : ''}`}`);
  const v = c.vista as GameView | null;
  if (v) {
    titulo('A mesa quando abriu o relato');
    console.log(`Rodada ${v.turn.round} (turno ${v.turn.number}), vez de ${v.players[v.turn.active]?.name}, ${v.turn.stepName}; prioridade: ${v.priority === null ? '-' : v.players[v.priority]?.name}`);
    console.log(v.players.map((p) => `${p.name}: ${p.life} vida, mão ${p.handCount}, grimório ${p.libraryCount}${p.lost ? ' (perdeu)' : ''}${p.left ? ' (saiu)' : ''}`).join('\n'));
    if (v.stack.length) console.log(`Pilha: ${v.stack.map((s) => `${s.name}${s.targets.length ? ` → ${s.targets.join(', ')}` : ''}`).join(' | ')}`);
    if (v.decision) console.log(`Decisão pendente: ${v.decision.kind}${'prompt' in v.decision ? ` — ${(v.decision as any).prompt}` : ''}`);
    if (v.waiting) console.log(`Esperando: ${v.players[v.waiting.player]?.name} (${v.waiting.kind})`);
    if (v.gameOver) console.log(`Fim: ${v.gameOver.reason}`);
    console.log('Registro (últimas 15):');
    for (const l of v.log.slice(-15)) console.log(`  [${l.round ?? l.turn}] ${l.text}`);
  }
  if (c.erroNaTela) console.log(`\nAviso na tela: ${c.erroNaTela}`);
  const d = c.diagnostico as { erros: Ocorrencia[]; enviadas: Ocorrencia[]; doServidor: Ocorrencia[]; abertaHaSegundos: number } | undefined;
  if (d) {
    titulo(`Erros da página (${d.erros.length})`);
    for (const o of d.erros.slice(-10)) console.log(`  ${o.em.slice(11, 19)} ${o.tipo}: ${linha(o.texto, 300)}`);
    titulo(`Avisos do servidor para a pessoa (${d.doServidor.length})`);
    for (const o of d.doServidor.slice(-10)) console.log(`  ${o.em.slice(11, 19)} ${linha(o.texto, 200)}`);
    titulo(`Últimas ações mandadas (${d.enviadas.length}, página aberta há ${Math.round(d.abertaHaSegundos / 60)} min)`);
    for (const o of d.enviadas.slice(-15)) console.log(`  ${o.em.slice(11, 19)} ${linha(o.texto, 200)}`);
  }
  const s = r.servidor as { versao?: string; diario?: { em: number; nivel: string; texto: string }[] };
  titulo('Servidor');
  const agora = versaoAgora();
  console.log(`Versão no relato: ${s.versao ?? '?'}${agora && s.versao && agora.split(' ')[0] !== s.versao.split(' ')[0] ? `\nVersão agora:     ${agora} (o código mudou desde o relato)` : ''}`);
  const diario = s.diario ?? [];
  console.log(`Erros e avisos na hora antes do relato: ${diario.length}`);
  for (const l of diario.slice(-12)) console.log(`  ${new Date(l.em).toLocaleTimeString('pt-BR')} ${l.nivel}: ${linha(l.texto, 400)}`);
  console.log(`\nPasta: ${pasta}`);
  if (r.partida) console.log(`Refazer: node ferramentas/relatos.ts reproduzir ${numeroCurto(r.id)}`);
}

interface PartidaRelato {
  voce: number;
  erro: string | null;
  partida: { config: GameConfig; listas: DeckList[] | null; entradas: Input[]; checkpoint: Checkpoint | null } | null;
}

function reproduzir(r: RelatoGravado, ate: number | null): void {
  const pasta = relatos.pastaDe(r.id);
  const arq = join(pasta, 'partida.json');
  if (!existsSync(arq)) { console.error(`O relato ${numeroCurto(r.id)} veio sem a partida${r.partidaAusente ? ` (${r.partidaAusente})` : ''}`); process.exit(1); }
  const p = JSON.parse(readFileSync(arq, 'utf8')) as PartidaRelato;
  if (!p.partida) { console.error('A sala não tinha partida quando o relato foi feito'); process.exit(1); }
  if (!p.partida.listas) { console.error('A partida veio sem as listas dos decks'); process.exit(1); }
  const entradas = ate === null ? p.partida.entradas : p.partida.entradas.slice(0, ate);
  console.log(`Refazendo ${entradas.length} de ${p.partida.entradas.length} entradas (semente ${p.partida.config.seed}) com o motor de agora…`);
  const t0 = Date.now();
  // do começo, sem checkpoint: confere a partida inteira (o checkpoint do servidor é só um atalho)
  const { game, aplicadas, erro } = Game.replayAteFalhar(p.partida.config, p.partida.listas, entradas, null);
  console.log(`${aplicadas} entradas aplicadas em ${((Date.now() - t0) / 1000).toFixed(1)} s.`);
  if (erro) {
    console.log(`\nO MOTOR FALHA NA ENTRADA ${aplicadas}: ${erro.message}`);
    console.log(`Entrada: ${JSON.stringify(entradas[aplicadas])}`);
    console.log(erro.stack?.split('\n').slice(1, 8).join('\n'));
  }
  if (p.erro) console.log(`Erro que a sala guardava: ${p.erro}`);
  const vista = buildView(game.g, p.voce, game.pendingDecision());
  writeFileSync(join(pasta, 'reproducao-vista.json'), JSON.stringify(vista, null, 2));

  // compara com a mesa que a pessoa via quando abriu o relato
  const antes = (r.contexto as Record<string, any>).vista as GameView | null;
  if (antes && ate === null) {
    titulo('Comparando com a mesa da pessoa');
    const dif: string[] = [];
    const cmp = (nome: string, a: unknown, b: unknown) => { if (JSON.stringify(a) !== JSON.stringify(b)) dif.push(`${nome}: a pessoa via ${JSON.stringify(a)}, refeito dá ${JSON.stringify(b)}`); };
    cmp('turno', antes.turn.number, vista.turn.number);
    cmp('etapa', antes.turn.step, vista.turn.step);
    cmp('pilha', antes.stack.map((s) => s.name), vista.stack.map((s) => s.name));
    antes.players.forEach((pa, i) => {
      const pb = vista.players[i];
      cmp(`vida de ${pa.name}`, pa.life, pb?.life);
      cmp(`mão de ${pa.name}`, pa.handCount, pb?.handCount);
      cmp(`grimório de ${pa.name}`, pa.libraryCount, pb?.libraryCount);
    });
    cmp('permanentes', antes.battlefield.length, vista.battlefield.length);
    // a partida pode ter andado entre abrir a janela e enviar: diferença aqui nem sempre é erro
    console.log(dif.length ? dif.join('\n') + '\n(a partida pode ter andado entre abrir e enviar o relato)' : 'Igual ao que a pessoa via (turno, etapa, pilha, vidas, mãos, grimórios, permanentes).');
  }
  titulo('Partida refeita');
  console.log(`Rodada ${vista.turn.round} (turno ${vista.turn.number}), vez de ${vista.players[vista.turn.active]?.name}, ${vista.turn.stepName}`);
  console.log(vista.players.map((x) => `${x.name}: ${x.life} vida, mão ${x.handCount}`).join(' · '));
  if (vista.decision) console.log(`Decisão pendente: ${vista.decision.kind}`);
  console.log('Registro (últimas 12):');
  for (const l of vista.log.slice(-12)) console.log(`  [${l.round ?? l.turn}] ${l.text}`);
  console.log(`\nVista refeita (do assento ${p.voce}): ${join(pasta, 'reproducao-vista.json')}`);
  console.log('Para investigar: Game.replay(config, listas, entradas.slice(0, N)) com o partida.json da pasta.');
}

const [cmd, ...args] = process.argv.slice(2);
switch (cmd) {
  case 'listar': case undefined: listar(args.includes('--todos')); break;
  case 'ver': ver(achar(args[0])); break;
  case 'reproduzir': {
    const i = args.indexOf('--ate');
    reproduzir(achar(args.find((a, k) => !a.startsWith('--') && args[k - 1] !== '--ate')), i >= 0 ? Number(args[i + 1]) : null);
    break;
  }
  case 'resolver': { const r = achar(args[0]); relatos.marcar(r.id, 'resolvido', args.slice(1).join(' ')); console.log(`Relato ${numeroCurto(r.id)} resolvido.`); break; }
  case 'reabrir': { const r = achar(args[0]); relatos.marcar(r.id, 'aberto'); console.log(`Relato ${numeroCurto(r.id)} reaberto.`); break; }
  default: console.error('Uso: node ferramentas/relatos.ts listar [--todos] | ver <número> | reproduzir <número> [--ate N] | resolver <número> [nota] | reabrir <número>'); process.exit(1);
}
