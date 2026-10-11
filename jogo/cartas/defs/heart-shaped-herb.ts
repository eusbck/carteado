// Heart-Shaped Herb
// If a source an opponent controls would deal damage to you, prevent 1 of that damage.
// {2}, {T}, Sacrifice this artifact: You may sacrifice a creature. If you do, return that card to the battlefield under
// its owner's control with three +1/+1 counters on it and you become the monarch.
import { activated, becomeMonarch, chooseItems, controllerOf, creaturesOf, defineCard, nameOf, objItem, putOntoBattlefield, sacrifice, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Heart-Shaped Herb',
  faces: [{
    abilities: [
      staticAbility({
        rules: {
          preventsSomeDamage: (c, alvo, fonte) => {
            if (alvo.kind !== 'player' || alvo.id !== c.you) return 0;
            const o = c.g.state.objects[fonte] ?? c.g.state.lki[fonte]?.obj;
            const quem = o ? (c.g.state.objects[fonte] && o.zone === 'battlefield' ? controllerOf(c.g, fonte) : (o.stack?.controller ?? o.controller)) : null;
            return quem !== null && c.g.isOpponent(c.you, quem) ? 1 : 0;
          },
        },
        text: 'Se uma fonte que um oponente controla fosse causar dano a você, previna 1 desse dano.',
      }),
      activated('{2}, {T}, Sacrifice this artifact', function* (c) {
        const s = c.g.state;
        const minhas = creaturesOf(c.g, c.you);
        if (!minhas.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Heart-Shaped Herb: você pode sacrificar uma criatura (ela volta com três marcadores +1/+1 e você se torna o monarca)', minhas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (!esc.length) return;
        const [nova] = yield* sacrifice(c.g, [Number(esc[0])]);
        if (nova === null || nova === undefined) return;
        // "essa carta": a ficha sacrificada não volta; a carta só volta se foi para o cemitério
        if (s.objects[nova]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id: nova, controller: s.objects[nova].owner, counters: { '+1/+1': 3 } }], 'effect');
        becomeMonarch(c.g, c.you);
      }, { text: '{2}, {T}, Sacrifique este artefato: Você pode sacrificar uma criatura. Se fizer isso, devolva essa carta ao campo sob o controle do dono com três marcadores +1/+1 e você se torna o monarca.' }),
    ],
  }],
  rulings: {},
});