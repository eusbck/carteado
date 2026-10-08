// Ajudantes da linguagem de efeitos que dependem de ações (evita importação circular em dsl.ts).
import { chooseItems, objItem, yesNo } from './ask.ts';
import { nameOf } from './chars.ts';
import type { Gen, SCtx } from './defs.ts';
import type { ObjId } from './types.ts';

export { dealDamage, lookAndArrange, returnToHand } from './actions.ts';

/** pergunta se revela uma carta da mão (snarl); registra a revelação no log (CR 701.20) */
export function* yesNoReveal(c: SCtx, cands: ObjId[], subtypes: string[]): Gen<boolean> {
  const yes = yield* yesNo(c.g, c.you, `Revelar uma carta ${subtypes.join(' ou ')} da mão para este terreno entrar desvirado?`);
  if (!yes) return false;
  let id = cands[0];
  if (cands.length > 1) {
    const [pick] = yield* chooseItems(c.g, c.you, 'Escolha a carta a revelar', cands.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
    id = Number(pick);
  }
  c.g.log(`${c.g.state.players[c.you].name} revela ${nameOf(c.g, id)}.`, { rule: '701.20' });
  return true;
}
