// Peças repetidas nas cartas do deck Vampiric Bloodline.
import { controlledBy, etb, isSubtype, nameOf, searchTo, shuffleLibrary, t, tgtPlayer, yesNo } from '../motor/api.ts';
import type { TriggeredDef } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId } from '../motor/types.ts';

/** fichas de Blood que o jogador controla (qualquer ficha de artefato com o subtipo Blood, mesmo com outros subtipos) */
export function fichasDeSangue(g: G, p: PlayerId): ObjId[] {
  return controlledBy(g, p, (id) => g.state.objects[id].isToken && isSubtype(g, id, 'Blood'));
}

/**
 * "Parceiro com [nome]" (CR 702.124j): quando esta criatura entra, o jogador alvo pode pôr [nome] do grimório dele na
 * mão e depois embaralhar. (A parte de ter os dois como comandantes é da montagem do deck.)
 */
export function parceiroCom(nome: string): TriggeredDef {
  return etb(function* (c) {
    const p = tgtPlayer(c);
    if (p === null) return;
    if (!(yield* yesNo(c.g, p, `Parceiro com ${nome}: procurar ${nome} no seu grimório e pôr na sua mão?`))) return;
    const achou = yield* searchTo({ ...c, you: p }, p, (id) => nameOf(c.g, id) === nome, 1, 'hand', { reveal: true, prompt: `Escolha ${nome}` });
    if (!achou.length) shuffleLibrary(c.g, p);
  }, { targets: [t.player()], text: `Parceiro com ${nome} (quando esta criatura entra, o jogador alvo pode pôr ${nome} do grimório dele na mão e depois embaralhar).` });
}
