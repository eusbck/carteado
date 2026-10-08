// Geier Reach Sanitarium — Legendary Land
// {T}: Add {C}.
// {2}, {T}: Each player draws a card, then discards a card.
import { activated, chooseItems, defineCard, draw, mana, moveObjects, nameOf } from '../../motor/api.ts';
import type { ObjId, ZoneName } from '../../motor/types.ts';

export default defineCard({
  name: 'Geier Reach Sanitarium',
  faces: [{
    abilities: [
      mana('C'),
      activated('{2}, {T}', function* (c) {
        for (const p of c.g.apnap()) yield* draw(c.g, p, 1);
        // ruling 1 (CR 101.4): cada jogador escolhe em ordem APNAP, sem revelar; depois todos descartam ao mesmo tempo
        const escolhidas: ObjId[] = [];
        for (const p of c.g.apnap()) {
          const mao = c.g.state.zones.hand[p];
          if (mao.length === 0) continue;
          if (mao.length === 1) { escolhidas.push(mao[0]); continue; }
          const [id] = yield* chooseItems(c.g, p, 'Geier Reach Sanitarium: escolha uma carta para descartar', mao.map((x) => ({ id: String(x), label: nameOf(c.g, x), obj: x, card: { def: c.g.state.objects[x].def } })), 1, 1);
          escolhidas.push(Number(id));
        }
        if (escolhidas.length) yield* moveObjects(c.g, escolhidas.map((id) => ({ id, to: 'graveyard' as ZoneName })), 'discard');
      }, { text: '{2}, {T}: Cada jogador compra uma carta e depois descarta uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: cada jogador compra; depois escolhem em ordem APNAP e descartam todos juntos',
    2: 'não se aplica: nenhuma carta dos decks tem loucura',
  },
});
