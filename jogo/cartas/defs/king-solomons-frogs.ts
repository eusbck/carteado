// King Solomon's Frogs
// Flash
// When King Solomon's Frogs enters, if you cast it, for each opponent, exile up to one target permanent that player
// controls with mana value 3 or greater. For each permanent exiled this way, its controller draws a card.
// {3}, {T}, Exile King Solomon's Frogs: You become the monarch.
import { activated, becomeMonarch, controllerOf, defineCard, draw, etb, exile, keyword, manaValue } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';
import { umaPorOponente } from '../viloes.ts';

export default defineCard({
  name: "King Solomon's Frogs",
  faces: [{
    abilities: [
      keyword('flash'),
      etb(function* (c) {
        const s = c.g.state;
        const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' && s.objects[r.id]?.zone === 'battlefield' ? [r.id as ObjId] : []));
        const controladores = new Map<ObjId, PlayerId>(ids.map((id) => [id, controllerOf(c.g, id)]));
        const exiladas = yield* exile(c.g, ids);
        // uma carta para o controlador de cada permanente que foi mesmo exilada
        for (let i = 0; i < ids.length; i++) if (exiladas[i] !== null && exiladas[i] !== undefined) yield* draw(c.g, controladores.get(ids[i])!, 1);
      }, {
        // CR 603.4: "se você a conjurou"; a permanente guarda os dados da mágica que foi
        condition: (c) => (c.g.state.objects[c.source] ?? c.g.state.lki[c.source]?.obj)?.data.spell !== undefined,
        targets: [umaPorOponente('para cada oponente, até uma permanente alvo que esse jogador controla com valor de mana 3 ou maior', (c, id) => manaValue(c.g, id) >= 3)],
        text: "Quando King Solomon's Frogs entra, se você a conjurou, para cada oponente, exile até uma permanente alvo que esse jogador controla com valor de mana 3 ou maior. Para cada permanente exilada assim, o controlador dela compra uma carta.",
      }),
      activated('{3}, {T}, Exile this artifact', function* (c) { becomeMonarch(c.g, c.you); }, { text: "{3}, {T}, Exile King Solomon's Frogs: Você se torna o monarca." }),
    ],
  }],
  rulings: {},
});