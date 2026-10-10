// Quando a mesa espera por você fora do seu turno (ou com algo na pilha), isso precisa ficar óbvio: sem o aviso,
// parecia que o bot tinha travado (fase 9, item 1.1). Lógica pura, testada em testes/fase9-paradas.test.ts.

import type { Decision } from '../../../motor/types.ts';
import type { GameView } from '../../../motor/view.ts';

export interface AvisoPrioridade {
  /** antes do destaque ("Sua vez de responder a") */
  texto: string;
  /** o que está em jogo (a mágica, o nome da etapa) */
  destaque: string;
  /** depois do destaque (" de ROBSON") */
  resto: string;
  /** de quem é a mágica ou o turno (para a cor) */
  jogador: number;
}

/** o aviso grande de "a mesa está esperando você"; null quando é só a prioridade normal do seu turno */
export function avisoPrioridade(v: GameView, eu: number, d: Decision | null): AvisoPrioridade | null {
  if (!d || d.kind !== 'priority' || v.gameOver) return null;
  const topo = v.stack[0]; // a vista manda a pilha de cima para baixo
  const nome = (p: number) => v.players[p]?.name ?? `Jogador ${p + 1}`;
  if (topo && topo.controller !== eu) {
    const oque = topo.kind === 'spell' ? topo.name : `habilidade de ${topo.name}`;
    return { texto: 'Sua vez de responder a ', destaque: oque, resto: ` de ${nome(topo.controller)}`, jogador: topo.controller };
  }
  if (topo) return { texto: 'Sua vez de responder à sua ', destaque: topo.kind === 'spell' ? topo.name : `habilidade de ${topo.name}`, resto: '', jogador: eu };
  // a parada inteligente no ataque de outro: o aviso diz quem atacou (a etapa sozinha não explica por que parou)
  if (v.turn.active !== eu && v.turn.step === 'declareAttackers' && v.combat?.attackers.length) {
    return { texto: `${nome(v.turn.active)} `, destaque: 'atacou', resto: ': sua vez de responder', jogador: v.turn.active };
  }
  if (v.turn.active !== eu) return { texto: `Turno de ${nome(v.turn.active)}, `, destaque: v.turn.stepName, resto: ': sua vez de agir', jogador: v.turn.active };
  return null;
}
