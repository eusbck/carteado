// Raiders' Karve
// Whenever this Vehicle attacks, look at the top card of your library. If it's a land card, you may put it onto the
// battlefield tapped.
// Crew 3 (Tap any number of creatures you control with total power 3 or more: This Vehicle becomes an artifact creature
// until end of turn.)
import { crew, defineCard, isLand, nameOf, on, putOntoBattlefield, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: "Raiders' Karve",
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        const [topo] = c.g.state.zones.library[c.you];
        if (topo === undefined || !isLand(c.g, topo)) return;
        if (yield* yesNo(c.g, c.you, `Raiders' Karve: colocar ${nameOf(c.g, topo)} no campo virado?`)) {
          yield* putOntoBattlefield(c.g, [{ id: topo, controller: c.you, tapped: true }], 'effect');
        }
      }, { text: 'Sempre que este Veículo ataca, olhe a carta do topo do seu grimório. Se for uma carta de terreno, você pode colocá-la no campo virada.' }),
      crew(3),
    ],
  }],
  rulings: {},
});
