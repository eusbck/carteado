// Patchwork Banner
// As this artifact enters, choose a creature type.
// Creatures you control of the chosen type get +1/+1.
// {T}: Add one mana of any color.
import { anthem, asEnters, chars, chooseCreatureType, controllerOf, defineCard, isCreature, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Patchwork Banner',
  faces: [{
    abilities: [
      // CR 614.12a: a escolha é feita antes de entrar; fica gravada no objeto (CR 607.2d)
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, c.you, 'Patchwork Banner: escolha um tipo de criatura');
      }, 'Ao entrar, escolha um tipo de criatura.'),
      anthem((c, id) => {
        const t = c.g.state.objects[c.source]?.choices.creatureType as string | undefined;
        return !!t && isCreature(c.g, id) && controllerOf(c.g, id) === c.you && chars(c.g, id).subtypes.includes(t);
      }, () => [{ k: 'pt', p: 1, t: 1 }], 'As criaturas que você controla do tipo escolhido recebem +1/+1.'),
      mana('any', { text: '{T}: Adicione uma mana de qualquer cor.' }),
    ],
  }],
  rulings: { 1: 'teste: só tipos de criatura existentes aparecem na escolha' },
});
