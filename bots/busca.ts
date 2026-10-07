// Busca do Magic God (fase 9): Monte Carlo com informação oculta, parecida com o ISMCTS de um observador.
//
// 1. Pré-seleção rasa, como a Cartomante (as candidatas nos mesmos mundos sorteados), com cerca de um terço do tempo.
// 2. As melhores candidatas e "passar" são jogadas até o fim do turno seguinte, em mundos sorteados a cada rodada
//    (com a leitura da mesa da Cartomante): todos jogam terrenos e mágicas, atacam e bloqueiam com políticas rápidas,
//    e os oponentes respondem com o que têm na mão sorteada. Cada rodada joga todas as opções no mesmo mundo.
// 3. Fica a opção com a melhor média; a rasa desempata.

import type { LiveDecision } from '../motor/ask.ts';
import { seedFrom } from '../motor/rng.ts';
import type { Answer, Decision } from '../motor/types.ts';
import type { Contexto, HeuristicBot } from './heuristico.ts';
import { politicaRapida } from './heuristico.ts';
import { ramo } from './mundo.ts';
import { simular, type Politica } from './simulacao.ts';

type D<K extends Decision['kind']> = Extract<Decision, { kind: K }>;
const PASSAR: Answer = { kind: 'priority', action: 'pass' };

export function buscar(bot: HeuristicBot, ctx: Contexto, acoes: D<'priority'>['actions']): Answer {
  const inicio = performance.now();
  const total = Math.max(0, ctx.prazo - inicio);
  const fixas = bot.jogadasBusca;
  const rasa = bot.avaliarCandidatas(ctx, acoes, 14, fixas !== null ? Infinity : inicio + 0.35 * total);
  if (!rasa || !ctx.copia) return PASSAR;
  const top = [...rasa.lista].sort((a, b) => b.valor - a.valor).slice(0, 3);
  if (!top.length) return PASSAR;
  // decisão óbvia: uma jogada bem acima da segunda e de passar (o tempo é teto, não meta)
  const segunda = top[1]?.valor ?? -Infinity;
  if (top[0].valor > rasa.base + 6 && top[0].valor > segunda + 4) { bot.e.plano = top[0].plano; return { kind: 'priority', action: top[0].acao }; }
  const opcoes: Answer[] = [PASSAR, ...top.map((c) => ({ kind: 'priority', action: c.acao }) as Answer)];
  const somas = opcoes.map(() => 0);
  let rodadas = 0;
  const eu = bot.eu;
  const avaliacao = { papeis: true, lider: bot.p.lider };
  for (;;) {
    if (fixas !== null ? rodadas >= fixas : performance.now() >= ctx.prazo) break;
    const mundo = ramo(bot.e.rng, `b${rodadas}`);
    const valores: number[] = [];
    for (const a of opcoes) {
      const f = ctx.copia(mundo);
      if (!f) return PASSAR;
      const r2 = seedFrom(`r:${mundo.join(':')}`);
      const minhaPrioridade: Politica = (d, g) => (d.kind === 'priority' ? politicaRapida(d, g, r2) ?? PASSAR : PASSAR);
      const r = simular(f, eu, a, bot.politicaMinha(0, r2), bot.politicaOutros(r2, true), { horizonte: 'proximo', avaliacao, minhaPrioridade });
      valores.push(Number.isFinite(r.valor) ? r.valor : -1e6);
      if (fixas === null && performance.now() >= ctx.prazo + 0.25 * total) break; // trava: não passa muito do prazo
    }
    if (valores.length < opcoes.length) break;
    valores.forEach((v, i) => { somas[i] += v; });
    rodadas++;
  }
  if (!rodadas) {
    // sem tempo para as jogadas longas: fica com a rasa
    const b = top[0];
    if (b.valor > rasa.base + bot.p.margem) { bot.e.plano = b.plano; return { kind: 'priority', action: b.acao }; }
    return PASSAR;
  }
  const medias = somas.map((s) => s / rodadas);
  // a rasa desempata (diferenças pequenas nas jogadas longas são ruído)
  const nota = medias.map((m, i) => m + (i === 0 ? rasa.base : top[i - 1].valor) * 0.05);
  let melhor = 0;
  for (let i = 1; i < opcoes.length; i++) if (nota[i] > nota[melhor]) melhor = i;
  if (melhor === 0 || nota[melhor] < nota[0] + bot.p.margem * 0.5) return PASSAR;
  bot.e.plano = top[melhor - 1].plano;
  void (ctx.d as LiveDecision);
  return opcoes[melhor];
}
