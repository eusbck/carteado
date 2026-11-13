// Mortuary Mire
// This land enters tapped.
// When this land enters, you may put target creature card from your graveyard on top of your library.
// {T}: Add {B}.
import { defineCard, entersTapped, etb, is, mana, moveObjects, t, tgt, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Mortuary Mire',
  faces: [{
    abilities: [
      entersTapped(),
      // "você pode": o alvo é opcional (até um)
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'library', position: 'top' }], 'effect');
      }, { targets: [upTo(1, t.card('graveyard', is.creature, 'carta de criatura alvo do seu cemitério'))], text: 'Quando este terreno entra, você pode colocar a carta de criatura alvo do seu cemitério no topo do seu grimório.' }),
      mana('B'),
    ],
  }],
  rulings: {},
});
