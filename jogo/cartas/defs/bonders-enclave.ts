// Bonders' Enclave
// {T}: Add {C}.
// {3}, {T}: Draw a card. Activate only if you control a creature with power 4 or greater.
import { activated, controlledBy, defineCard, draw, isCreature, mana, power } from '../../motor/api.ts';

export default defineCard({
  name: "Bonders' Enclave",
  faces: [{
    abilities: [
      mana('C'),
      // CR 602.5b: a restrição é checada só ao ativar (rulings 1 e 2)
      activated('{3}, {T}', function* (c) {
        yield* draw(c.g, c.you, 1);
      }, {
        condition: (c) => controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && (power(c.g, id) ?? 0) >= 4).length > 0,
        text: '{3}, {T}: Compre uma carta. Ative apenas se você controlar uma criatura com força 4 ou mais.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: depois de ativada, a condição não é checada de novo',
    2: 'regra geral: CR 602.2 — ninguém age durante a ativação (o motor ativa e paga sem dar prioridade)',
  },
});
