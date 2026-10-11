// Titan of Littjara
// As this creature enters, choose a creature type.
// This creature is the chosen type in addition to its other types.
// Whenever this creature enters or attacks, you may draw a card for each other creature you control that shares a
// creature type with it. If you do, discard a card.
import { asEnters, chars, chooseCreatureType, creaturesOf, defineCard, discard, draw, on, selfGets, triggered, yesNo } from '../../motor/api.ts';
import type { EffectFn } from '../../motor/defs.ts';

const compra: EffectFn = function* (c) {
  if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
  const meus = chars(c.g, c.source).subtypes;
  const n = creaturesOf(c.g, c.you).filter((id) => id !== c.source && chars(c.g, id).subtypes.some((x) => meus.includes(x))).length;
  if (n <= 0) return;
  if (!(yield* yesNo(c.g, c.you, `Titan of Littjara: comprar ${n} carta${n > 1 ? 's' : ''} e depois descartar uma?`))) return;
  yield* draw(c.g, c.you, n);
  yield* discard(c.g, c.you, 1);
};
const TEXTO = 'Sempre que esta criatura entra ou ataca, você pode comprar uma carta para cada outra criatura que você controla que compartilha um tipo de criatura com ela. Se fizer isso, descarte uma carta.';

export default defineCard({
  name: 'Titan of Littjara',
  faces: [{
    abilities: [
      // ruling 1: escolhido ao entrar, sem respostas (CR 614.12a)
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, c.you, 'Titan of Littjara: escolha um tipo de criatura');
      }, 'Ao entrar, escolha um tipo de criatura.'),
      selfGets((c) => {
        const tipo = c.g.state.objects[c.source]?.choices.creatureType as string | undefined;
        return tipo ? [{ k: 'addTypes', subtypes: [tipo] }] : [];
      }, 'Esta criatura é do tipo escolhido além dos outros tipos dela.'),
      triggered(on.selfEnters(), compra, { text: TEXTO }),
      triggered(on.selfAttacks(), compra, { text: TEXTO }),
    ],
  }],
  rulings: {
    1: 'teste: escolhe um tipo ao entrar, passa a ser desse tipo e compra pelas outras criaturas que compartilham um tipo',
    2: 'regra geral: CR 205.3m — só tipos de criatura existentes são oferecidos, um só (motor/efeitos.ts chooseCreatureType)',
  },
});
