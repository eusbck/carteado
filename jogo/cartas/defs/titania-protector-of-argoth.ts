// Titania, Protector of Argoth
// When Titania enters, return target land card from your graveyard to the battlefield.
// Whenever a land you control is put into a graveyard from the battlefield, create a 5/3 green Elemental creature token.
import { createTokens, defineCard, etb, is, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';
import { seuTerrenoVaiProCemiterio } from '../terras.ts';

export default defineCard({
  name: 'Titania, Protector of Argoth',
  faces: [{
    abilities: [
      etb(function* (c) { const id = tgt(c); if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect'); },
        { targets: [t.card('graveyard', is.land, 'carta de terreno alvo do seu cemitério')], text: 'Quando Titania entra, devolva a carta de terreno alvo do seu cemitério ao campo de batalha.' }),
      triggered(seuTerrenoVaiProCemiterio(), function* (c) { yield* createTokens(c.g, c.you, 'Elemental 5/3', 1); },
        { text: 'Sempre que um terreno que você controla é colocado num cemitério vindo do campo de batalha, crie uma ficha de criatura Elemental verde 5/3.' }),
    ],
  }],
  rulings: {},
});
