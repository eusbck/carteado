// Soaring Seacliff
// This land enters tapped.
// When this land enters, target creature gains flying until end of turn.
// {T}: Add {U}.
import { defineCard, etb, land, mana, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Soaring Seacliff',
  faces: [{
    abilities: [
      land.tapped(),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'flying' }]);
      }, { targets: [t.creature()], text: 'Quando este terreno entra, a criatura alvo ganha voar até o fim do turno.' }),
      mana('U'),
    ],
  }],
  rulings: {},
});
