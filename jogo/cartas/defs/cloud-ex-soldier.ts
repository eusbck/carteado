// Cloud, Ex-SOLDIER
// Haste
// When Cloud enters, attach up to one target Equipment you control to it.
// Whenever Cloud attacks, draw a card for each equipped attacking creature you control. Then if Cloud has power 7 or
// greater, create two Treasure tokens.
import { and, attach, chars, controllerOf, createTokens, defineCard, draw, etb, is, keyword, lkiChars, on, t, tgt, triggered, upTo } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';
import { atacantes } from '../vingadores.ts';

/** criaturas atacantes do jogador com pelo menos um Equipamento anexado (de qualquer controlador) */
function atacantesEquipadas(g: G, p: PlayerId): ObjId[] {
  const s = g.state;
  return atacantes(g).filter((id) => controllerOf(g, id) === p
    && s.zones.battlefield.some((a) => s.objects[a].attachedTo === id && chars(g, a).subtypes.includes('Equipment')));
}

export default defineCard({
  name: 'Cloud, Ex-SOLDIER',
  faces: [{
    abilities: [
      keyword('haste'),
      etb(function* (c) {
        const eq = tgt(c);
        // ruling 1: se o Equipamento não pode ser anexado a Cloud (CR 301.5c), ele fica onde está
        if (eq !== null && c.g.state.objects[c.source]?.zone === 'battlefield') attach(c.g, eq, c.source);
      }, {
        targets: [upTo(1, t.permanent(and(is.subtype('Equipment'), is.yours), 'Equipamento alvo que você controla'))],
        text: 'Quando Cloud entra, anexe a ele até um Equipamento alvo que você controla.',
      }),
      triggered(on.selfAttacks(), function* (c) {
        const n = atacantesEquipadas(c.g, c.you).length;
        if (n > 0) yield* draw(c.g, c.you, n);
        // se Cloud saiu do campo, vale a última informação conhecida (CR 608.2h)
        const o = c.g.state.objects[c.source];
        const forca = o?.zone === 'battlefield' ? chars(c.g, c.source).power : lkiChars(c.g, c.source)?.power;
        if ((forca ?? 0) >= 7) yield* createTokens(c.g, c.you, 'Treasure', 2);
      }, { text: 'Sempre que Cloud ataca, compre uma carta para cada criatura equipada atacante que você controla. Depois, se Cloud tiver força 7 ou mais, crie duas fichas de Treasure.' }),
    ],
  }],
  rulings: {
    1: 'teste: um Equipamento que não pode ser anexado a Cloud continua onde está',
  },
});
