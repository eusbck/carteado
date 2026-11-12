// Ajudantes do deck Yuriko (lote 4, frente D): anular "a menos que pague".
import { counter, mayPay } from '../motor/api.ts';
import type { Ctx, Gen } from '../motor/defs.ts';
import type { ObjId } from '../motor/types.ts';

/**
 * "Anule a mágica alvo a menos que o controlador dela pague {N}" (CR 118.12a: quem controla a mágica decide e paga na
 * resolução). Devolve true se a mágica foi anulada. `exilar`: "se for anulada assim, exile-a em vez de pô-la no
 * cemitério" (Spell Shrivel).
 */
export function* anulaAMenosQuePague(c: Ctx, id: ObjId, custo: string, nome: string, opts: { exilar?: boolean } = {}): Gen<boolean> {
  const quem = c.g.state.objects[id]?.stack?.controller;
  if (quem !== undefined && !c.g.state.players[quem].left && (yield* mayPay(c, quem, custo, `a mágica não ser anulada (${nome})`))) return false;
  return yield* anula(c, id, opts);
}

/** anula a mágica; com `exilar`, ela vai para o exílio em vez do cemitério só se for anulada assim */
export function* anula(c: Ctx, id: ObjId, opts: { exilar?: boolean } = {}): Gen<boolean> {
  const o = c.g.state.objects[id];
  if (!o || o.zone !== 'stack') return false;
  const dados = o.stack?.data;
  const jaTinha = !!dados?.exileInsteadOfGraveyard;
  if (opts.exilar && dados) dados.exileInsteadOfGraveyard = true;
  const ok = yield* counter(c.g, id);
  // se não pôde ser anulada, ela segue para onde iria normalmente
  if (!ok && opts.exilar && dados && !jaTinha) delete dados.exileInsteadOfGraveyard;
  return ok;
}
