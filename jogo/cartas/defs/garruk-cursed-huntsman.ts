// Garruk, Cursed Huntsman
// 0: Create two 2/2 black and green Wolf creature tokens with "When this token dies, put a loyalty counter on each Garruk
// you control."
// −3: Destroy target creature. Draw a card.
// −6: You get an emblem with "Creatures you control get +3/+3 and have trample."
import { activated, controllerOf, createEmblem, createTokens, defineCard, defineEmblem, destroy, draw, isCreature, staticAbility, t, tgt } from '../../motor/api.ts';

// CR 114: o emblema fica na zona de comando e a habilidade funciona de lá
const EMBLEMA = 'Garruk, Cursed Huntsman (emblema)';
defineEmblem({
  id: EMBLEMA,
  name: 'Emblema de Garruk',
  abilities: [staticAbility({
    affects: (c, o) => isCreature(c.g, o.id) && controllerOf(c.g, o.id) === c.you,
    mods: () => [{ k: 'pt', p: 3, t: 3 }, { k: 'addKeyword', kw: 'trample' }],
    text: 'As criaturas que você controla recebem +3/+3 e têm atropelar.',
  })],
});

export default defineCard({
  name: 'Garruk, Cursed Huntsman',
  faces: [{
    abilities: [
      activated('0', function* (c) {
        yield* createTokens(c.g, c.you, 'Wolf de Garruk', 2);
      }, { text: '0: Crie duas fichas de criatura Wolf pretas e verdes 2/2 com "Quando esta ficha morre, coloque um marcador de lealdade em cada Garruk que você controla."' }),
      activated('−3', function* (c) {
        const id = tgt(c);
        // ruling 2: alvo ilegal, a habilidade não resolve; indestrutível, você compra mesmo assim
        if (id !== null) yield* destroy(c.g, [id]);
        yield* draw(c.g, c.you, 1);
      }, { targets: [t.creature()], text: '−3: Destrua a criatura alvo. Compre uma carta.' }),
      activated('−6', function* (c) {
        createEmblem(c.g, c.you, EMBLEMA);
      }, { text: '−6: Você recebe um emblema com "As criaturas que você controla recebem +3/+3 e têm atropelar."' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 704.3 — Garruk com 0 de lealdade e o Wolf morrem nas mesmas ações de estado, antes do gatilho',
    2: 'teste: −3 destrói a criatura alvo e compra; indestrutível, compra mesmo assim',
  },
});
