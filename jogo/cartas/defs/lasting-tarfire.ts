// Lasting Tarfire
// At the beginning of each end step, if you put a counter on a creature this turn, this enchantment deals 2 damage to
// each opponent.
import { dealDamage, defineCard, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Lasting Tarfire',
  faces: [{
    abilities: [triggered(on.endStep('each'), function* (c) {
      dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 2, combat: false })));
    }, {
      // ruling 1: verificado ao começar a etapa final (CR 603.4)
      condition: (c) => c.g.state.turnStats[c.you].countersPutOnCreatures > 0,
      text: 'No início de cada etapa final, se você colocou um marcador numa criatura neste turno, este encantamento causa 2 de dano a cada oponente.',
    })],
  }],
  rulings: { 1: 'teste: sem marcador no turno, não dispara' },
});
