// Rejoin the Fight
// Mill three cards. Then starting with the next opponent in turn order, each opponent chooses a creature card in your
// graveyard that hasn't been chosen. Return each card chosen this way to the battlefield under your control.
import { chooseItems, defineCard, isCreature, mill, nameOf, putOntoBattlefield } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Rejoin the Fight',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        yield* mill(c.g, c.you, 3);
        // CR 101.4: começando pelo próximo oponente na ordem de turno
        const escolhidas: ObjId[] = [];
        for (const p of c.g.apnap().filter((x) => c.g.isOpponent(c.you, x))) {
          const cands = s.zones.graveyard[c.you].filter((id) => isCreature(c.g, id) && !escolhidas.includes(id));
          if (!cands.length) break;
          const [id] = yield* chooseItems(c.g, p, 'Rejoin the Fight: escolha uma carta de criatura no cemitério de ' + s.players[c.you].name + ' para voltar ao campo', cands.map((x) => ({ id: String(x), label: nameOf(c.g, x), obj: x, card: { def: s.objects[x].def } })), 1, 1);
          escolhidas.push(Number(id));
        }
        if (escolhidas.length) yield* putOntoBattlefield(c.g, escolhidas.map((id) => ({ id, controller: c.you })), 'effect');
      },
    },
  }],
  rulings: {
  },
});
