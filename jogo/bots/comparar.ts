// Compara níveis de bot (fase 9, item 4.5) com sementes fixas.
//
// 1v1:  node bots/comparar.ts <nivelA> <nivelB> [partidas=100] [semente=comparar] [processos=6]
//       Cada semente é jogada duas vezes com os assentos trocados (mesmos decks, mesmo embaralhamento): a diferença
//       de força dos decks se anula e sobra a dos bots.
// mesa: node bots/comparar.ts mesa <n1,n2,n3,n4> [partidas=24] [semente] [processos=6]
//       4 jogadores; a cada partida os níveis giram de assento.
// Mostra vitórias por nível, empates, erros e o tempo por decisão (médio e máximo, das decisões que pensaram).
// Roda em processos separados (no máximo `processos`, padrão 6: metade das threads do notebook); cada processo grava
// o resultado em .cache/comparar/<nome>/ e o principal soma. Com PARTE=k/N roda só uma parte (uso interno).

import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HeuristicBot } from './heuristico.ts';
import { nivelValido, type NivelBot } from './niveis.ts';
import { runGame } from './estresse.ts';

interface Partida { seed: string; niveis: NivelBot[]; ok: boolean; erro?: string; vencedores: number[]; empate: boolean; turnos: number; ms: number }
interface Tempo { n: number; soma: number; max: number; pensadas: number; somaPensadas: number }
interface Parte { partidas: Partida[]; tempos: Record<string, Tempo> }

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const mesa = args[0] === 'mesa';
const niveisArg = (mesa ? args[1].split(',') : [args[0], args[1]]) as NivelBot[];
if (niveisArg.some((n) => !nivelValido(n))) {
  console.error('Uso: node bots/comparar.ts <nivelA> <nivelB> [partidas] [semente] [processos]  |  mesa <n1,n2,n3,n4> [partidas] [semente] [processos]');
  console.error('Níveis: iniciante, facil, intermediario, dificil, cartomante, magicgod');
  process.exit(2);
}
const total = Number(args[2] ?? (mesa ? 24 : 100));
const base = args[3] ?? 'comparar';
const processos = Number(args[4] ?? 6);
const nome = `${mesa ? 'mesa-' : ''}${niveisArg.join('-')}-${base}-${total}`;
const pasta = join(RAIZ, '.cache', 'comparar', nome);

/** a lista de partidas: em 1v1, pares espelhados; na mesa, os níveis girando de assento */
function partidas(): { seed: string; niveis: NivelBot[] }[] {
  const out: { seed: string; niveis: NivelBot[] }[] = [];
  if (!mesa) {
    for (let i = 0; out.length < total; i++) {
      const seed = `${base}-2p-${i}`;
      out.push({ seed, niveis: [niveisArg[0], niveisArg[1]] });
      if (out.length < total) out.push({ seed, niveis: [niveisArg[1], niveisArg[0]] });
    }
  } else {
    for (let i = 0; i < total; i++) {
      const r = i % 4;
      out.push({ seed: `${base}-4p-${Math.floor(i / 4)}`, niveis: niveisArg.map((_, k) => niveisArg[(k + r) % 4]) });
    }
  }
  return out;
}

function jogar(lista: { seed: string; niveis: NivelBot[] }[]): Parte {
  const tempos: Record<string, Tempo> = {};
  const res: Partida[] = [];
  for (const p of lista) {
    const r = runGame(p.seed, p.niveis.length, (assento, s) => {
      const nivel = p.niveis[assento];
      const b = new HeuristicBot(`${s}:${assento}`, assento, { nivel });
      const t = (tempos[nivel] ??= { n: 0, soma: 0, max: 0, pensadas: 0, somaPensadas: 0 });
      return {
        answer: (d, game) => {
          const t0 = performance.now();
          const a = b.answer(d, game);
          const dt = performance.now() - t0;
          t.n++; t.soma += dt; t.max = Math.max(t.max, dt);
          if (dt > 5) { t.pensadas++; t.somaPensadas += dt; }
          return a;
        },
      };
    }, { invariants: false });
    const linha: Partida = { seed: p.seed, niveis: p.niveis, ok: r.ok, erro: r.error, vencedores: r.winners, empate: r.draw, turnos: r.turns, ms: r.ms };
    res.push(linha);
    console.log(`${p.seed} [${p.niveis.join(' x ')}]: ${r.ok ? `${r.turns} turnos, ${r.draw ? 'empate' : `vence ${r.winners.map((w) => p.niveis[w]).join(',')}`}` : `FALHOU — ${r.error}`} (${(r.ms / 1000).toFixed(0)} s)`);
  }
  return { partidas: res, tempos };
}

const parte = process.env.PARTE;
if (parte) {
  const [k, n] = parte.split('/').map(Number);
  const lista = partidas().filter((_, i) => i % n === k);
  const r = jogar(lista);
  mkdirSync(pasta, { recursive: true });
  writeFileSync(join(pasta, `parte-${k}.json`), JSON.stringify(r));
  process.exit(0);
}

// principal: reparte entre processos e soma
mkdirSync(pasta, { recursive: true });
const t0 = Date.now();
const n = Math.max(1, Math.min(processos, total));
await Promise.all(Array.from({ length: n }, (_, k) => new Promise<void>((ok) => {
  if (existsSync(join(pasta, `parte-${k}.json`))) { ok(); return; } // retoma uma bateria interrompida
  const c = spawn(process.execPath, [fileURLToPath(import.meta.url), ...args], { env: { ...process.env, PARTE: `${k}/${n}` }, stdio: ['ignore', 'pipe', 'inherit'] });
  c.stdout.on('data', (d) => process.stdout.write(`[${k}] ${d}`));
  c.on('exit', () => ok());
})));
const todas: Partida[] = [];
const tempos: Record<string, Tempo> = {};
for (let k = 0; k < n; k++) {
  const f = join(pasta, `parte-${k}.json`);
  if (!existsSync(f)) { console.log(`parte ${k} não terminou`); continue; }
  const r = JSON.parse(readFileSync(f, 'utf8')) as Parte;
  todas.push(...r.partidas);
  for (const [nv, t] of Object.entries(r.tempos)) {
    const a = (tempos[nv] ??= { n: 0, soma: 0, max: 0, pensadas: 0, somaPensadas: 0 });
    a.n += t.n; a.soma += t.soma; a.max = Math.max(a.max, t.max); a.pensadas += t.pensadas; a.somaPensadas += t.somaPensadas;
  }
}
const vitorias: Record<string, number> = {};
let empates = 0, erros = 0;
for (const p of todas) {
  if (!p.ok) { erros++; continue; }
  if (p.empate) { empates++; continue; }
  for (const w of p.vencedores) vitorias[p.niveis[w]] = (vitorias[p.niveis[w]] ?? 0) + 1;
}
const validas = todas.filter((p) => p.ok).length;
const linhas = [
  `${nome}: ${todas.length} partidas (${validas} sem erro), ${((Date.now() - t0) / 60000).toFixed(1)} min`,
  ...[...new Set(niveisArg)].map((nv) => `  ${nv}: ${vitorias[nv] ?? 0} vitórias (${(100 * (vitorias[nv] ?? 0) / Math.max(1, validas)).toFixed(1)}%)`),
  `  empates: ${empates}; erros: ${erros}`,
  '  tempo por decisão (todas / as que pensaram):',
  ...Object.entries(tempos).map(([nv, t]) => `    ${nv}: média ${(t.soma / Math.max(1, t.n)).toFixed(1)} ms, máximo ${t.max.toFixed(0)} ms; pensadas ${t.pensadas}, média ${(t.somaPensadas / Math.max(1, t.pensadas)).toFixed(0)} ms`),
];
console.log('\n' + linhas.join('\n'));
writeFileSync(join(pasta, 'resumo.txt'), linhas.join('\n') + '\n');
for (const p of todas.filter((x) => !x.ok)) console.log(`erro em ${p.seed} [${p.niveis.join(',')}]: ${p.erro}`);
