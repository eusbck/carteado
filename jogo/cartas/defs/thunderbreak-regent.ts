// Thunderbreak Regent
// Flying
// Whenever a Dragon you control becomes the target of a spell or ability an opponent controls, this creature deals 3
// damage to that player.
import { controllerOf, dealDamage, defineCard, isSubtype, keyword, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Thunderbreak Regent',
  faces: [{
    abilities: [
      keyword('flying'),
      // um disparo por Dragon mirado em cada lote (mirado duas vezes pela mesma mágica, dispara uma vez: CR 603.2c)
      triggered(on.batch((evs, c) => {
        const vistos = new Set<string>();
        const out: Record<string, unknown>[] = [];
        for (const e of evs) {
          if (e.type !== 'target' || e.target.kind !== 'obj' || !c.g.isOpponent(c.you, e.controller)) continue;
          const id = e.target.id;
          if (!c.g.state.objects[id] || c.g.state.objects[id].zone !== 'battlefield' || !isSubtype(c.g, id, 'Dragon') || controllerOf(c.g, id) !== c.you) continue;
          const chave = `${e.by}:${id}`;
          if (vistos.has(chave)) continue;
          vistos.add(chave);
          out.push({ jogador: e.controller, dragao: id });
        }
        return out;
      }), function* (c) {
        // ruling 1: resolve antes da mágica ou habilidade que mirou (CR 603.3)
        dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: c.event.jogador as PlayerId }, amount: 3, combat: false }]);
      }, { text: 'Sempre que um Dragon que você controla se torna alvo de uma mágica ou habilidade que um oponente controla, esta criatura causa 3 de dano a esse jogador.' }),
    ],
  }],
  rulings: {
    1: 'teste: o gatilho resolve antes da mágica que mirou',
  },
});
