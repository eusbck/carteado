// Weathered Sentinels
// Defender, reach, vigilance, trample
// This creature can attack players who attacked you during their last turn as though it didn't have defender.
// Whenever this creature attacks, it gets +3/+3 and gains indestructible until end of turn.
import { defineCard, keywords, on, staticAbility, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Weathered Sentinels',
  faces: [{
    abilities: [
      ...keywords('defender', 'reach', 'vigilance', 'trample'),
      staticAbility({
        rules: {
          canAttackWithDefender: (c, criatura, alvo) => criatura === c.source && alvo.kind === 'player' && (c.g.state.lastTurnAttackedPlayers[alvo.id] ?? []).includes(c.you),
        },
        text: 'Esta criatura pode atacar jogadores que atacaram você durante o último turno deles como se não tivesse defensor.',
      }),
      triggered(on.selfAttacks(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p: 3, t: 3 }, { k: 'addKeyword', kw: 'indestructible' }]);
      }, { text: 'Sempre que esta criatura ataca, ela recebe +3/+3 e ganha indestrutível até o fim do turno.' }),
    ],
  }],
});
