// lote4-b: "precisa ser bloqueada se possível" (The Masamune; CR 509.1c). Gancho `mustBeBlockedIfAble` em RuleHooks.
//
// CR 509.1c: o defensor confere as exigências de bloqueio. A declaração não pode violar restrições e precisa cumprir o
// maior número possível de exigências sem violá-las. Aqui: cada atacante que "precisa ser bloqueado se possível" e que dá
// para bloquear (com ameaçar, por duas criaturas: CR 702.111b) conta uma exigência. A validação, junto com as exigências
// "bloqueia se puder", está em motor/exigencias-bloqueio.ts.

import { hooks } from './chars.ts';
import type { G } from './game-context.ts';
import type { ObjId } from './types.ts';

/** atacantes que precisam ser bloqueados se possível */
export function precisamSerBloqueadas(g: G, atacantes: ObjId[]): ObjId[] {
  const hs = hooks(g, 'mustBeBlockedIfAble');
  if (!hs.length) return [];
  return atacantes.filter((a) => hs.some((h) => h.fn(h.ctx, a)));
}
