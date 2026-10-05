// Compara bots: o assento 0 usa o bot heurístico e os outros, o aleatório (ou todos heurísticos com "todos").
// Uso: node bots/comparar.ts [partidas] [jogadores] [aleatorios|todos] [semente-base]
// Mostra vitórias por assento, empates e tempo médio.
import { HeuristicBot } from './heuristico.ts';
import { RandomBot } from './aleatorio.ts';
import { runGame } from './estresse.ts';

const n = Number(process.argv[2] ?? 10);
const jogadores = Number(process.argv[3] ?? 4);
const modo = process.argv[4] ?? 'aleatorios';
const base = process.argv[5] ?? 'comparar';
const simulacoes = Number(process.env.SIMULACOES ?? 16);
const vitorias = new Array(jogadores).fill(0);
let empates = 0;
let erros = 0;
let ms = 0;
for (let i = 0; i < n; i++) {
  const seed = `${base}-${jogadores}p-${i}`;
  const r = runGame(seed, jogadores, (p, s) => {
    if (p === 0 || modo === 'todos') { const b = new HeuristicBot(`${s}:${p}`, p, { simulacoes }); return { answer: (d, game) => b.answer(d, game) }; }
    const b = new RandomBot(`${s}:${p}`);
    return { answer: (d) => b.answer(d) };
  });
  ms += r.ms;
  if (!r.ok) { erros++; console.log(`${seed}: FALHOU — ${r.error}`); continue; }
  if (r.draw) empates++;
  for (const w of r.winners) vitorias[w]++;
  console.log(`${seed}: ${r.turns} turnos, ${r.draw ? 'empate' : `vencedor ${r.winners.join(',')}`}, ${r.ms} ms`);
}
console.log(`\nvitórias por assento: ${vitorias.join(' / ')}; empates: ${empates}; erros: ${erros}; tempo médio: ${(ms / n / 1000).toFixed(1)} s`);
