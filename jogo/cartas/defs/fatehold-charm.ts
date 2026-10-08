// Fatehold Charm
// Choose one —
// • Draw a card. Empower Jace 2.
// • Return target spell or creature to its owner's hand.
// • Creatures you control get +1/+2 until end of turn.
import { creaturesOf, defineCard, draw, isCreature, modal, moveObject, tgt, untilEndOfTurn } from '../../motor/api.ts';
import { empowerJace } from '../fichas.ts';

export default defineCard({
  name: 'Fatehold Charm',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        {
          text: 'Compre uma carta. Fortaleça Jace 2.',
          *effect(c) {
            yield* draw(c.g, c.you, 1);
            yield* empowerJace(c, 2);
          },
        },
        {
          text: 'Devolva a mágica ou criatura alvo para a mão do dono.',
          // um alvo só, que pode ser mágica na pilha ou criatura no campo (CR 115.1, 700.2f)
          targets: [{ what: 'spellOrPermanent', label: 'mágica ou criatura alvo', filter: (c, t) => t.kind === 'obj' && (c.g.state.objects[t.id]?.zone === 'stack' || isCreature(c.g, t.id)) }],
          *effect(c) {
            const id = tgt(c);
            if (id !== null) yield* moveObject(c.g, id, 'hand', 'bounce');
          },
        },
        {
          text: 'As criaturas que você controla recebem +1/+2 até o fim do turno.',
          *effect(c) { untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'pt', p: 1, t: 2 }]); },
        },
      ]),
    },
  }],
  rulings: {
    1: 'teste: Jace que não é ficha não recebe os marcadores; cria-se a ficha',
    2: 'teste: sem ficha de Jace, cria uma com 0 de lealdade e põe 2 marcadores',
    3: 'não se aplica: o modo que fortalece Jace não tem alvos',
    4: 'teste: com ficha de Jace no campo, não cria outra; com duas, você escolhe qual recebe',
  },
});
