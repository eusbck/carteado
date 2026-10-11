// Scourge of the Throne
// Flying
// Dethrone (Whenever this creature attacks the player with the most life or tied for most life, put a +1/+1 counter on it.)
// Whenever this creature attacks for the first time each turn, if it's attacking the player with the most life or tied
// for most life, untap all attacking creatures. After this phase, there is an additional combat phase.
import { addCombatPhaseAfterCurrent, defineCard, dethrone, hasMostLife, keyword, on, triggered, untapAttackers } from '../../motor/api.ts';
import type { G } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

/** está atacando o jogador com mais vida (ou empatado)? Atacar um planeswalker não conta (ruling 1) */
function atacaQuemTemMaisVida(g: G, id: ObjId): boolean {
  const a = g.state.combat?.attackers.find((x) => x.id === id && !x.removed);
  return !!a && a.target.kind === 'player' && hasMostLife(g, a.target.id);
}

export default defineCard({
  name: 'Scourge of the Throne',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 702.105a
      dethrone(),
      triggered(on.selfAttacks(), function* (c) {
        untapAttackers(c.g);
        // CR 500.8: o combate adicional vem logo depois desta fase
        addCombatPhaseAfterCurrent(c.g);
      }, {
        oncePerTurn: true,
        // ruling 2 (CR 603.4): cláusula "se" interveniente, conferida ao disparar e de novo ao resolver
        condition: (c) => atacaQuemTemMaisVida(c.g, c.source),
        text: 'Sempre que esta criatura ataca pela primeira vez a cada turno, se ela está atacando o jogador com mais vida ou empatado com mais vida, desvire todas as criaturas atacantes. Depois desta fase, há uma fase de combate adicional.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.105a — destronar não dispara ao atacar um planeswalker (testes/regras-criaturas.test.ts)',
    2: 'teste: se o jogador atacado não tem mais vida ao resolver, não desvira nem há combate adicional',
    3: 'regra geral: CR 702.105a — destronar confere a vida só ao disparar (testes/regras-criaturas.test.ts)',
    4: 'teste: atacando quem tem mais vida, recebe o marcador antes dos bloqueadores, desvira e há um combate adicional',
    5: 'não se aplica: Gigante de Duas Cabeças não é jogado nesta mesa',
  },
});
