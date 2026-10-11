// Contemplar / behold (CR 701.4). Veio do trabalho do lote2-c (motor/conjurar-alternativo.ts), que ainda não foi
// juntado: quando ele entrar, este arquivo sai e fica só a função de lá.

import { chooseItems, objItem } from './ask.ts';
import { controllerOf, nameOf } from './chars.ts';
import type { Ctx, Gen, SCtx } from './defs.ts';
import type { ObjId, PlayerId } from './types.ts';

/**
 * "Behold a [qualidade]" (CR 701.4a): revele uma carta com a qualidade da mão ou escolha um permanente com a qualidade
 * que você controla. `optional` para "you may behold". Devolve o que foi contemplado (701.4b: a qualidade conta no
 * momento da ação) ou null.
 */
export function* behold(c: Ctx | (SCtx & { you: PlayerId }), quality: (id: ObjId) => boolean, label: string, opts: { optional?: boolean } = {}): Gen<{ id: ObjId; from: 'battlefield' | 'hand' } | null> {
  const g = c.g;
  const s = g.state;
  const p = c.you;
  const campo = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && controllerOf(g, id) === p && quality(id));
  const mao = s.zones.hand[p].filter((id) => quality(id));
  if (!campo.length && !mao.length) return null;
  const itens = [
    ...campo.map((id) => objItem(g, id, `${nameOf(g, id)} (no campo)`)),
    ...mao.map((id) => ({ ...objItem(g, id, `${nameOf(g, id)} (revelar da mão)`), card: { def: s.objects[id].def } })),
  ];
  const esc = yield* chooseItems(g, p, `Contemplar ${label}: escolha ${label} que você controla ou revele uma carta da sua mão${opts.optional ? ' (ou nenhuma)' : ''}`, itens, opts.optional ? 0 : 1, 1);
  if (!esc.length) return null;
  const id = Number(esc[0]);
  const from = campo.includes(id) ? 'battlefield' : 'hand';
  g.log(`${s.players[p].name} contempla ${nameOf(g, id)}${from === 'hand' ? ' (revelada da mão)' : ''}.`, { rule: '701.4a' });
  return { id, from };
}
