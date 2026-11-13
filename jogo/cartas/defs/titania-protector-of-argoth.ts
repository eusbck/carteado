// Titania, Protector of Argoth
// When Titania enters, return target land card from your graveyard to the battlefield.
// Whenever a land you control is put into a graveyard from the battlefield, create a 5/3 green Elemental creature token.
import { createTokens, defineCard, etb, is, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Titania, Protector of Argoth',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        targets: [t.card('graveyard', is.land, 'carta de terreno alvo do seu cemitério', 'you')],
        text: 'Quando Titania entra, devolva a carta de terreno alvo do seu cemitério para o campo.',
      }),
      // um disparo por terreno (não é "um ou mais"); olha o terreno pela última informação (CR 603.10a)
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard') return false;
        const l = c.g.state.lki[e.old];
        return !!l && l.chars.types.includes('Land') && l.chars.controller === c.you;
      }), function* (c) {
        yield* createTokens(c.g, c.you, 'Elemental 5/3', 1);
      }, { text: 'Sempre que um terreno que você controla é colocado num cemitério vindo do campo, crie uma ficha de criatura Elemental 5/3 verde.' }),
    ],
  }],
  rulings: {},
});
