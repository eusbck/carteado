// Steely Resolve
// As this enchantment enters, choose a creature type.
// Creatures of the chosen type have shroud. (They can't be the targets of spells or abilities.)
import { anthem, asEnters, chars, chooseCreatureType, defineCard, isCreature } from '../../motor/api.ts';

export default defineCard({
  name: 'Steely Resolve',
  faces: [{
    abilities: [
      asEnters(function* (c, ev) { ev.choices.tipo = yield* chooseCreatureType(c.g, c.you, 'Steely Resolve: escolha um tipo de criatura'); }, 'Conforme este encantamento entra, escolha um tipo de criatura.'),
      // todas as criaturas do tipo, de qualquer jogador
      anthem((c, id) => {
        const tipo = c.g.state.objects[c.source]?.choices.tipo as string | undefined;
        return !!tipo && isCreature(c.g, id) && chars(c.g, id).subtypes.includes(tipo);
      }, () => [{ k: 'addKeyword', kw: 'shroud' }], 'As criaturas do tipo escolhido têm resistência a magia total.'),
    ],
  }],
  rulings: {},
});
