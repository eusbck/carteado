// Defiling Daemogoth
// Menace
// Whenever a creature you control deals combat damage to a player, you gain 1 life.
// At the beginning of your end step, each opponent loses X life, where X is the amount of life you gained this turn.
import { defineCard, gainLife, isCreature, keyword, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Defiling Daemogoth',
  faces: [{
    abilities: [
      keyword('menace'),
      triggered(on.custom((e, c) => e.type === 'damage' && e.combat && e.target.kind === 'player' && e.controller === c.you && !!c.g.state.objects[e.source] && isCreature(c.g, e.source)), function* (c) {
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que uma criatura que você controla causa dano de combate a um jogador, você ganha 1 de vida.' }),
      triggered(on.endStep('you'), function* (c) {
        // ruling 1: X na resolução
        const x = c.g.state.turnStats[c.you].lifeGained;
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, x, c.source);
      }, { text: 'No início da sua etapa final, cada oponente perde X de vida, onde X é a vida que você ganhou neste turno.' }),
    ],
  }],
  rulings: { 1: 'teste: X conta na resolução' },
});
