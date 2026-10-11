// Guttersnipe
// Whenever you cast an instant or sorcery spell, this creature deals 2 damage to each opponent.
import { dealDamage, defineCard, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Guttersnipe',
  faces: [{
    abilities: [
      // ruling 2: resolve antes da mágica, mesmo que ela seja anulada
      triggered(on.youCast(is.instantOrSorcery), function* (c) {
        dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 2, combat: false })));
      }, { text: 'Sempre que você conjura uma mágica instantânea ou de feitiço, esta criatura causa 2 de dano a cada oponente.' }),
    ],
  }],
  rulings: {
    1: 'não se aplica: Gigante de Duas Cabeças fora do escopo',
    2: 'teste: causa 2 de dano a cada oponente antes de a mágica resolver',
  },
});
