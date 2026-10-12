// Ray Fillet, Wave Warrior
// Flying
// Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature,
// put a +1/+1 counter on this creature.)
// Whenever a creature you control with a counter on it deals combat damage to a player, draw a card.
import { controllerOf, defineCard, draw, evolve, isCreature, keyword, on, triggered } from '../../motor/api.ts';
import { temMarcador } from '../tartarugas.ts';

const EVOLUIR = 'regra geral: CR 702.100a — evoluir compara força com força e resistência com resistência, ao disparar e ao resolver (motor/criaturas.ts evolve)';

export default defineCard({
  name: 'Ray Fillet, Wave Warrior',
  faces: [{
    abilities: [
      keyword('flying'),
      evolve(),
      triggered(on.custom((e, c) => e.type === 'damage' && e.combat && e.target.kind === 'player' && !!c.g.state.objects[e.source] && isCreature(c.g, e.source)
        && controllerOf(c.g, e.source) === c.you && temMarcador(c.g, e.source)), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que uma criatura que você controla com um marcador causa dano de combate a um jogador, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: EVOLUIR,
    2: EVOLUIR,
    3: 'teste: voar e evoluir; a criatura sua com marcador que causa dano de combate a um jogador compra uma carta',
    4: EVOLUIR,
    5: EVOLUIR,
    6: 'regra geral: CR 702.100a — os marcadores com que a criatura entra contam na comparação (motor/criaturas.ts evolve)',
  },
});