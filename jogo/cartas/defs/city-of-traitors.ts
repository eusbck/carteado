// City of Traitors
// When you play another land, sacrifice this land.
// {T}: Add {C}{C}.
import { controllerOf, defineCard, mana, sacrifice, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'City of Traitors',
  faces: [{
    abilities: [
      // rulings 1-2: só jogar outro terreno dispara (CR 305.1); pôr no campo por efeito não (cause 'play')
      triggered({ kind: 'event', match: (e, c) => e.type === 'zone' && e.to === 'battlefield' && e.cause === 'play' && e.obj !== c.source && !!c.g.state.objects[e.obj] && controllerOf(c.g, e.obj) === c.you }, function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') yield* sacrifice(c.g, [c.source]);
      }, { text: 'Quando você jogar outro terreno, sacrifique este terreno.' }),
      mana('CC'),
    ],
  }],
  rulings: {
    1: 'teste: um terreno posto no campo por efeito não dispara',
    2: 'teste: jogar a própria City não dispara; jogar outro terreno a sacrifica',
  },
});
