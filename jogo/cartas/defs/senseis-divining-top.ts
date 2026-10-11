// Sensei's Divining Top
// {1}: Look at the top three cards of your library, then put them back in any order.
// {T}: Draw a card, then put this artifact on top of its owner's library.
import { activated, defineCard, draw, moveObjects } from '../../motor/api.ts';
import { reordenaTopo } from '../esquisitos.ts';

export default defineCard({
  name: "Sensei's Divining Top",
  faces: [{
    abilities: [
      activated('{1}', function* (c) { yield* reordenaTopo(c, 3, "Sensei's Divining Top"); }, { text: '{1}: Olhe as três cartas do topo do seu grimório e depois coloque-as de volta em qualquer ordem.' }),
      activated('{T}', function* (c) {
        yield* draw(c.g, c.you, 1);
        // ruling 2: se o Top já saiu do campo, fica onde está
        if (c.g.state.objects[c.source]?.zone === 'battlefield') yield* moveObjects(c.g, [{ id: c.source, to: 'library', position: 'top' }], 'effect');
      }, { text: '{T}: Compre uma carta e depois coloque este artefato no topo do grimório do dono dele.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 117.3 — a segunda habilidade pode ser ativada em resposta à primeira; a pilha resolve de cima para baixo',
    2: 'teste: {T}: compra uma carta e o Top vai para o topo do grimório',
  },
});
