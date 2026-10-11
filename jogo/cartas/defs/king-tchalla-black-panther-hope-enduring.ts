// King T'Challa // Black Panther, Hope Enduring (modal de duas faces que também transforma: CR 712.3, 712.9)
// King T'Challa {1}{W}{U} — Legendary Creature — Human Noble Hero 3/2
// Flash
// Whenever a player draws their second card each turn, you draw a card.
// {4}{W}{U}: Transform King T'Challa. Activate only as a sorcery.
// Black Panther, Hope Enduring {4}{W}{U} — Legendary Creature — Human Warrior Hero 3/3
// Flash
// Double strike
// Prevent all damage that would be dealt to Black Panther.
// Whenever Black Panther deals combat damage to a player, draw a card.
import { activated, defineCard, draw, keywords, on, staticAbility, transformFrom, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "King T'Challa // Black Panther, Hope Enduring",
  faces: [
    {
      abilities: [
        ...keywords('flash'),
        // as estatísticas do turno já contam a compra quando o gatilho é verificado (como Faerie Mastermind)
        triggered(on.custom((e, c) => e.type === 'draw' && c.g.state.turnStats[e.player].cardsDrawn === 2), function* (c) {
          yield* draw(c.g, c.you, 1);
        }, { text: 'Sempre que um jogador compra a segunda carta dele num turno, você compra uma carta.' }),
        // CR 701.28f: transforma só se ainda estiver com a frente para cima
        activated('{4}{W}{U}', function* (c) { transformFrom(c.g, c.source, 0); }, {
          timing: 'sorcery', text: '{4}{W}{U}: Transforme King T\'Challa. Ative só como feitiço.',
        }),
      ],
    },
    {
      abilities: [
        ...keywords('flash', 'double strike'),
        staticAbility({
          text: 'Previna todo o dano que seria causado a Black Panther.',
          rules: { preventsDamage: (c, alvo) => alvo.kind === 'obj' && alvo.id === c.source },
        }),
        triggered(on.selfDealsCombatDamageToPlayer(), function* (c) { yield* draw(c.g, c.you, 1); }, {
          text: 'Sempre que Black Panther causa dano de combate a um jogador, compre uma carta.',
        }),
      ],
    },
  ],
  rulings: {},
});
