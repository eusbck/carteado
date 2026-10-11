// Killmonger, Ruthless Usurper
// Trample
// Whenever Killmonger attacks, he gets +1/+0 until end of turn for each artifact defending player controls.
// Whenever Killmonger deals combat damage to a player, that player sacrifices an artifact of their choice and you create
// a Treasure token.
import { controlledBy, controllerOf, createTokens, defineCard, eachSacrifices, isType, keyword, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Killmonger, Ruthless Usurper',
  faces: [{
    abilities: [
      keyword('trample'),
      triggered(on.selfAttacks(), function* (c) {
        // jogador defensor: quem Killmonger ataca, ou quem controla o planeswalker ou a batalha atacada
        const a = c.g.state.combat?.attackers.find((x) => x.id === c.source && !x.removed);
        if (!a || c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        const defensor = a.target.kind === 'player' ? a.target.id : controllerOf(c.g, a.target.id);
        const n = controlledBy(c.g, defensor, (id) => isType(c.g, id, 'Artifact')).length;
        if (n > 0) untilEndOfTurn(c, [c.source], [{ k: 'pt', p: n, t: 0 }]);
      }, { text: 'Sempre que Killmonger ataca, ele recebe +1/+0 até o fim do turno para cada artefato que o jogador defensor controla.' }),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const p = c.event.player as PlayerId;
        yield* eachSacrifices(c, [p], (id) => isType(c.g, id, 'Artifact'), 1, 'um artefato');
        // o Treasure é criado mesmo que o jogador não tenha artefato para sacrificar
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { text: 'Sempre que Killmonger causa dano de combate a um jogador, esse jogador sacrifica um artefato à escolha dele e você cria uma ficha de Treasure.' }),
    ],
  }],
  rulings: {},
});
