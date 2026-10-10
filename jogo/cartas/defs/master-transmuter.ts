// Master Transmuter
// {U}, {T}, Return an artifact you control to its owner's hand: You may put an artifact card from your hand onto the battlefield.
import { activated, chooseItems, defineCard, isType, nameOf, objItem, putOntoBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: "Master Transmuter",
  faces: [{
    abilities: [activated("{U}, {T}, Return an artifact you control to its owner's hand", function*(c) {
      const hand = c.g.state.zones.hand[c.you].filter((id) => isType(c.g, id, 'Artifact'));
      const picked = yield* chooseItems(c.g, c.you, 'Master Transmuter: você pode colocar um artefato da mão no campo', hand.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
      if (picked.length) yield* putOntoBattlefield(c.g, [{ id: Number(picked[0]), controller: c.you }], 'effect');
    }, { text: '{U}, {T}, Devolva um artefato seu à mão do dono: você pode colocar um artefato da mão no campo.' })]
  }],
  rulings: {
    "1": "teste: Master Transmuter pode devolver a si mesma como custo, depois de pagar {T}.",
    "2": "CR 400.7: teste: a mesma carta devolvida pode entrar como um novo objeto, sem os marcadores anteriores."
  },
});
