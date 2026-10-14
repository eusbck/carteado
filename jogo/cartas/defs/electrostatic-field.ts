// Electrostatic Field
// Defender
// Whenever you cast an instant or sorcery spell, this creature deals 1 damage to each opponent.
import { dealDamage, defineCard, is, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Electrostatic Field',
  faces: [{
    abilities: [
      keyword('defender'),
      // ruling 2: o gatilho resolve antes da mágica, mesmo que ela seja anulada (CR 603.3)
      triggered(on.youCast(is.instantOrSorcery), function* (c) {
        const ops = c.g.opponents(c.you).filter((p) => !c.g.state.players[p].left);
        dealDamage(c.g, ops.map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 1, combat: false })));
      }, { text: 'Sempre que você conjura uma mágica instantânea ou de feitiço, esta criatura causa 1 de dano a cada oponente.' }),
    ],
  }],
  rulings: {
    1: 'não se aplica: Gigante de Duas Cabeças não é jogado na mesa',
    2: 'teste: o gatilho causa 1 de dano a cada oponente antes de a mágica resolver',
  },
});
