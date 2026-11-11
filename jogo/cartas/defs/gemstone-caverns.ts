// Gemstone Caverns
// If this card is in your opening hand and you're not the starting player, you may begin the game with Gemstone Caverns
// on the battlefield with a luck counter on it. If you do, exile a card from your hand.
// {T}: Add {C}. If Gemstone Caverns has a luck counter on it, instead add one mana of any color.
import { chooseItems, defineCard, exile, mana, nameOf, objItem, putOntoBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Gemstone Caverns',
  faces: [{
    // CR 103.6 (motor/turn.ts): depois dos mulligans, quem não é o jogador inicial pode começar com ela no campo
    openingHand: {
      label: 'começar a partida com Gemstone Caverns no campo, com um marcador de sorte, exilando uma carta da mão',
      condition: (c) => c.g.state.turnOrder[0] !== c.you,
      *act(c) {
        const [id] = yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you, counters: { luck: 1 } }], 'openingHand');
        if (id === undefined) return;
        const mao = c.g.state.zones.hand[c.you];
        if (!mao.length) return;
        const [r] = yield* chooseItems(c.g, c.you, 'Gemstone Caverns: exile uma carta da sua mão', mao.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
        yield* exile(c.g, [Number(r)]);
      },
    },
    abilities: [
      mana((c) => ((c.g.state.objects[c.source]?.counters.luck ?? 0) > 0 ? [['W'], ['U'], ['B'], ['R'], ['G']] : [['C']]), {
        text: '{T}: Adicione {C}. Se Gemstone Caverns tiver um marcador de sorte, em vez disso adicione uma mana de qualquer cor.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 704.5j — a regra da lenda tira as cópias a mais antes da primeira prioridade (motor/sba.ts)',
    2: 'teste: depois dos mulligans, quem não começa pode pôr Gemstone Caverns no campo e exila uma carta da mão',
  },
});
