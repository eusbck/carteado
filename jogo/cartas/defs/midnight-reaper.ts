// Midnight Reaper
// Whenever a nontoken creature you control dies, this creature deals 1 damage to you and you draw a card.
import { dealDamage, defineCard, draw, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Midnight Reaper',
  faces: [{
    abilities: [
      // rulings 1-2: habilidade de sair do campo, olha para trás (CR 603.10a): dispara pela própria morte e pela
      // de cada criatura que morre junto
      triggered(on.dies((c, l, old) => !old.isToken && l.controller === c.you), function* (c) {
        // se já saiu do campo, causa o dano pela última informação conhecida (CR 113.7a, 608.2h)
        dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: c.you }, amount: 1, combat: false }]);
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que uma criatura não ficha que você controla morre, esta criatura causa 1 de dano a você e você compra uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: CR 603.10a: dispara quando a própria Midnight Reaper morre',
    2: 'teste: CR 603.10a: morrendo junto com outras, dispara por cada uma',
  },
});
