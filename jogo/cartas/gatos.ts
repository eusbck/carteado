// Peças repetidas nas cartas do deck Raining Cats and Dogs.
import { chooseItems, controllerOf, creaturesOf, nameOf, objItem, on, returnToHand } from '../motor/api.ts';
import type { Ctx, Gen, SCtx, TriggerSpec } from '../motor/defs.ts';
import type { ObjId } from '../motor/types.ts';

/**
 * "Sempre que uma ou mais [criaturas que passam no filtro] que você controla causam dano de combate a um jogador":
 * um gatilho por jogador que tomou dano no mesmo lote (c.event.jogador).
 */
export function seusCausamDanoDeCombate(filtro: (c: SCtx, id: ObjId) => boolean): TriggerSpec {
  return on.batch((evs, c) => {
    const jogadores = new Set<number>();
    for (const e of evs) {
      if (e.type !== 'damage' || !e.combat || e.target.kind !== 'player') continue;
      const o = c.g.state.objects[e.source];
      if (o && o.zone === 'battlefield' && controllerOf(c.g, e.source) === c.you && filtro(c, e.source)) jogadores.add(e.target.id);
    }
    return [...jogadores].map((jogador) => ({ jogador }));
  });
}

/** "devolva uma criatura que você controla para a mão do dono": escolhida na resolução, sem alvo; devolve qual foi */
export function* devolveCriatura(c: Ctx, rotulo: string, filtro: (id: ObjId) => boolean = () => true, opcional = false): Gen<ObjId | null> {
  const minhas = creaturesOf(c.g, c.you).filter(filtro);
  if (!minhas.length) return null;
  const itens = minhas.map((id) => objItem(c.g, id, nameOf(c.g, id)));
  const [esc] = yield* chooseItems(c.g, c.you, `${rotulo}: escolha a criatura que volta para a mão do dono`, opcional ? [{ id: '', label: 'Nenhuma' }, ...itens] : itens, 1, 1);
  if (!esc) return null;
  yield* returnToHand(c.g, [Number(esc)]);
  return Number(esc);
}
