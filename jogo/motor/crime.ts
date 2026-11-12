// lote4-b: cometer um crime (CR 700.13). Usado por Gisa, the Hellraiser e Forsaken Miner (deck Sephiroth).
//
// CR 700.13: um jogador comete um crime quando conjura uma mágica, ativa uma habilidade ou põe uma habilidade
// desencadeada na pilha e essa mágica ou habilidade tem como alvo pelo menos um oponente; um permanente, mágica ou
// habilidade que um oponente controla; e/ou uma carta no cemitério de um oponente.
// - Um crime por mágica ou habilidade, por mais alvos "criminosos" que ela tenha (ruling 4 de Gisa, the Hellraiser).
// - Só os alvos escolhidos ao conjurar, ativar ou pôr na pilha contam: mudar os alvos depois não comete crime (ruling 5),
//   e copiar uma mágica ou habilidade também não (a cópia não foi conjurada, ativada nem posta na pilha por disparo).

import type { TriggerSpec } from './defs.ts';
import type { GameEvent } from './events.ts';
import type { G } from './game-context.ts';
import type { ObjId, PlayerId, TargetRef } from './types.ts';

/** o alvo é "criminoso" para `p` (CR 700.13): oponente, coisa que um oponente controla, carta no cemitério de um oponente */
export function alvoCriminoso(g: G, p: PlayerId, t: TargetRef): boolean {
  if (t.kind === 'player') return g.isOpponent(p, t.id);
  const o = g.state.objects[t.id];
  if (!o) return false;
  if (o.zone === 'graveyard') return g.isOpponent(p, o.owner);
  if (o.zone === 'stack') return g.isOpponent(p, o.stack?.controller ?? o.controller);
  if (o.zone === 'battlefield') return g.isOpponent(p, o.controller);
  return false;
}

/**
 * Crimes cometidos num lote de eventos: um por mágica conjurada, habilidade ativada ou habilidade desencadeada posta na
 * pilha que tem pelo menos um alvo criminoso. `por` é a mágica ou habilidade na pilha; `jogador`, quem cometeu.
 */
export function crimesNoLote(g: G, evs: GameEvent[]): { jogador: PlayerId; por: ObjId }[] {
  const novos = new Set<ObjId>();
  for (const e of evs) {
    if (e.type === 'cast' && !e.copy) novos.add(e.obj);
    else if (e.type === 'activate' || e.type === 'triggerOnStack') novos.add(e.obj);
  }
  const out: { jogador: PlayerId; por: ObjId }[] = [];
  const vistos = new Set<ObjId>();
  for (const e of evs) {
    if (e.type !== 'target' || !novos.has(e.by) || vistos.has(e.by)) continue;
    if (!alvoCriminoso(g, e.controller, e.target)) continue;
    vistos.add(e.by);
    out.push({ jogador: e.controller, por: e.by });
  }
  return out;
}

/** "Sempre que você comete um crime" (CR 700.13): dispara uma vez por mágica ou habilidade criminosa; `c.event.por` é ela */
export function onYouCommitCrime(): TriggerSpec {
  return {
    kind: 'batch',
    match: (evs, c) => crimesNoLote(c.g, evs).filter((x) => x.jogador === c.you).map((x) => ({ por: x.por })),
  };
}
