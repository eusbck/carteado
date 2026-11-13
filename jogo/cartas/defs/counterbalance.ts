// Counterbalance
// Whenever an opponent casts a spell, you may reveal the top card of your library. If you do, counter that spell if it
// has the same mana value as the revealed card.
import { counter, defineCard, manaValue, on, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { jog, obj, reg } from '../../motor/registro.ts';

export default defineCard({
  name: 'Counterbalance',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => (e.type === 'cast' && c.g.isOpponent(c.you, e.player) ? { magica: e.obj } : false)), function* (c) {
        const topo = c.g.state.zones.library[c.you][0];
        if (topo === undefined) return;
        if (!(yield* yesNo(c.g, c.you, `Counterbalance: revelar a carta do topo do seu grimório?`, 'Revelar', 'Não revelar'))) return;
        const mv = manaValue(c.g, topo);
        reg(c.g, 'revela', { rule: '701.20' })`${jog(c.you)} revela ${obj(topo)} (valor de mana ${mv}).`;
        const id = c.event.magica as ObjId;
        // ruling 2: na pilha o valor de mana inclui o X escolhido; no grimório, X vale 0 (CR 202.3e). Ruling 1: metade
        // de carta dividida conjurada tem o valor só dela; a carta dividida revelada soma as duas (CR 709.4)
        if (c.g.state.objects[id]?.zone === 'stack' && manaValue(c.g, id) === mv) yield* counter(c.g, id);
      }, { text: 'Sempre que um oponente conjura uma mágica, você pode revelar a carta do topo do seu grimório. Se fizer isso, anule essa mágica se ela tiver o mesmo valor de mana da carta revelada.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 709.4 — o valor de mana da metade conjurada e da carta dividida fora da pilha (motor/formatos.ts)',
    2: 'teste: na pilha o valor de mana inclui o X; a carta revelada com X vale 0',
  },
});
