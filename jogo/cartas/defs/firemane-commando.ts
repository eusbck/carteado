// Firemane Commando
// Flying
// Whenever you attack with two or more creatures, draw a card.
// Whenever another player attacks with two or more creatures, they draw a card if none of those creatures attacked you.
import { defineCard, draw, keyword, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Firemane Commando',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.custom((e, c) => e.type === 'attackers' && e.player === c.you && e.attackers.length >= 2), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que você ataca com duas ou mais criaturas, compre uma carta.' }),
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers' || e.player === c.you || e.attackers.length < 2) return false;
        // rulings 1-3: olha todas as atacantes no momento do ataque; atacar um planeswalker seu não conta como atacar você
        return { player: e.player, atacouVoce: e.attackers.some((a) => a.target.kind === 'player' && a.target.id === c.you) };
      }), function* (c) {
        if (c.event.atacouVoce) return;
        yield* draw(c.g, c.event.player as PlayerId, 1);
      }, { text: 'Sempre que outro jogador ataca com duas ou mais criaturas, ele compra uma carta se nenhuma delas atacou você.' }),
    ],
  }],
  rulings: {
    1: 'teste: se alguma das atacantes atacou você, o outro jogador não compra',
    2: 'teste: atacando outro jogador com duas criaturas, ele compra',
    3: 'regra geral: CR 603.2 — a informação do ataque é fixada quando dispara',
  },
});
