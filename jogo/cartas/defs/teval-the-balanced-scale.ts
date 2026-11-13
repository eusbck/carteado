// Teval, the Balanced Scale
// Flying
// Whenever Teval attacks, mill three cards. Then you may return a land card from your graveyard to the battlefield
// tapped.
// Whenever one or more cards leave your graveyard, create a 2/2 black Zombie Druid creature token.
import { chooseItems, createTokens, defineCard, keyword, mill, nameOf, objItem, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import { cartaDeTerreno } from '../reanimar-terrenos.ts';

export default defineCard({
  name: 'Teval, the Balanced Scale',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfAttacks(), function* (c) {
        yield* mill(c.g, c.you, 3);
        // sem alvo: a carta é escolhida na resolução, entre todas as de terreno do cemitério
        const cands = c.g.state.zones.graveyard[c.you].filter((id) => cartaDeTerreno(c.g, id));
        if (!cands.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Teval: devolver uma carta de terreno do seu cemitério para o campo virada?', cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc !== undefined) yield* putOntoBattlefield(c.g, [{ id: Number(esc), controller: c.you, tapped: true }], 'effect');
      }, { text: 'Sempre que Teval ataca, moa três cartas. Depois, você pode devolver uma carta de terreno do seu cemitério para o campo virada.' }),
      // ruling 1: várias cartas saindo juntas disparam uma vez
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'zone' && e.from === 'graveyard' && e.owner === c.you)), function* (c) {
        yield* createTokens(c.g, c.you, 'Zombie Druid', 1);
      }, { text: 'Sempre que uma ou mais cartas saem do seu cemitério, crie uma ficha de criatura Zumbi Druida 2/2 preta.' }),
    ],
  }],
  rulings: { 1: 'teste: várias cartas saindo juntas criam um Zombie Druid só' },
});
