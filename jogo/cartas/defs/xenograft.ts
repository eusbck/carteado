// Xenograft
// As this enchantment enters, choose a creature type.
// Each creature you control is the chosen type in addition to its other types.
import { and, anthem, asEnters, chooseCreatureType, defineCard, is } from '../../motor/api.ts';

export default defineCard({
  name: 'Xenograft',
  faces: [{
    abilities: [
      // ruling 2: só tipos de criatura existentes (motor/efeitos.ts chooseCreatureType)
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, c.you, 'Xenograft: escolha um tipo de criatura');
      }, 'Ao entrar, escolha um tipo de criatura.'),
      // ruling 3: só as criaturas no campo (CR 613.1d, camada 4)
      anthem(and(is.creature, is.yours), (c) => {
        const tipo = c.g.state.objects[c.source]?.choices.creatureType as string | undefined;
        return tipo ? [{ k: 'addTypes', subtypes: [tipo] }] : [];
      }, 'Cada criatura que você controla é do tipo escolhido, além dos outros tipos dela.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 614.12 — as substituições de entrar olham a criatura já com o tipo escolhido (motor/actions.ts putOntoBattlefield)',
    2: 'regra geral: CR 205.3m — só tipos de criatura existentes são oferecidos (motor/efeitos.ts chooseCreatureType)',
    3: 'teste: as criaturas no campo ganham o tipo; as da mão não',
  },
});
