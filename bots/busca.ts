// Busca do Magic God (fase 9): Monte Carlo com informação oculta, parecida com o ISMCTS de um observador.
//
// 1. Pré-seleção rasa, como a da Cartomante e com pelo menos o mesmo tanto de análise (as candidatas nos mesmos mundos
//    sorteados, mais mundos que ela), com até metade do tempo.
//    Ela dá a escolha "de partida": a melhor candidata, se passar da margem, ou passar.
// 2. As melhores candidatas e "passar" são jogadas até o fim do turno seguinte, em mundos sorteados a cada rodada
//    (com a leitura da mesa da Cartomante): todos jogam terrenos e mágicas, atacam e bloqueiam com políticas rápidas,
//    e os oponentes respondem com o que têm na mão sorteada. Cada rodada joga todas as opções no mesmo mundo, então a
//    diferença entre duas opções numa rodada não depende da sorte do sorteio.
// 3. A escolha de partida só muda se as jogadas longas mostrarem outra opção claramente melhor: a diferença média
//    (pareada por rodada) acima de um erro-padrão. Sem evidência, fica a da pré-seleção.

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
  const rasa = bot.avaliarCandidatas(ctx, acoes, 14, fixas !== null ? Infinity : inicio + 0.5 * total);
  if (!rasa || !ctx.copia) return PASSAR;
  const top = [...rasa.lista].sort((a, b) => b.valor - a.valor).slice(0, 3);
  if (!top.length) return PASSAR;
  // a escolha de partida (a da Cartomante): 0 = passar, i = top[i - 1]
  const partida = top[0].valor > rasa.base + bot.p.margem ? 1 : 0;
  // decisão óbvia: uma jogada bem acima da segunda e de passar (o tempo é teto, não meta)
  const segunda = top[1]?.valor ?? -Infinity;
  if (partida === 1 && top[0].valor > rasa.base + 6 && top[0].valor > segunda + 4) { bot.e.plano = top[0].plano; return { kind: 'priority', action: top[0].acao }; }
  const opcoes: Answer[] = [PASSAR, ...top.map((c) => ({ kind: 'priority', action: c.acao }) as Answer)];
  const rodadas: number[][] = [];
  const eu = bot.eu;
  const avaliacao = { papeis: true, lider: bot.p.lider };
  for (;;) {
    if (fixas !== null ? rodadas.length >= fixas : performance.now() >= ctx.prazo) break;
    const mundo = ramo(bot.e.rng, `b${rodadas.length}`);
    const valores: number[] = [];
    for (const a of opcoes) {
      const f = ctx.copia(mundo);
      if (!f) break;
      const r2 = seedFrom(`r:${mundo.join(':')}`);
      const minhaPrioridade: Politica = (d, g) => (d.kind === 'priority' ? politicaRapida(d, g, r2) ?? PASSAR : PASSAR);
      const r = simular(f, eu, a, bot.politicaMinha(0, r2), bot.politicaOutros(r2, true), { horizonte: 'proximo', avaliacao, minhaPrioridade });
      valores.push(Number.isFinite(r.valor) ? r.valor : -1e6);
      if (fixas === null && performance.now() >= ctx.prazo) break; // rodada incompleta no prazo: fica de fora
    }
    if (valores.length < opcoes.length) break;
    rodadas.push(valores);
  }
  let escolha = partida;
  if (rodadas.length >= 3) {
    // diferença pareada de cada opção contra a de partida
    let melhor = 0;
    for (let i = 0; i < opcoes.length; i++) {
      if (i === partida) continue;
      const dif = rodadas.map((v) => v[i] - v[partida]);
      const m = dif.reduce((t, x) => t + x, 0) / dif.length;
      const dp = Math.sqrt(dif.reduce((t, x) => t + (x - m) ** 2, 0) / Math.max(1, dif.length - 1));
      const ep = dp / Math.sqrt(dif.length);
      if (m - ep > 0.5 && m > melhor) { melhor = m; escolha = i; }
    }
  }
  if (escolha === 0) return PASSAR;
  bot.e.plano = top[escolha - 1].plano;
  return opcoes[escolha];
}
