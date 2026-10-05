// Bitterthorn, Nissa's Animus
// Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)
// Equipped creature gets +1/+1.
// Whenever equipped creature attacks, you may search your library for a basic land card, put it onto the battlefield
// tapped, then shuffle.
// Equip {3}
import { attach, attachedGets, createTokens, defineCard, equip, etb, maySearchBasicToBattlefield, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Bitterthorn, Nissa's Animus",
  faces: [{
    abilities: [
      // Arma viva (CR 702.92)
      etb(function* (c) {
        const [germe] = yield* createTokens(c.g, c.you, 'Phyrexian Germ', 1);
        if (germe !== undefined && c.g.state.objects[c.source]) attach(c.g, c.source, germe);
      }, { kw: 'living weapon', text: 'Arma viva (quando este Equipamento entra, crie uma ficha de criatura Phyrexian Germ preta 0/0 e anexe-o a ela).' }),
      attachedGets(() => [{ k: 'pt', p: 1, t: 1 }], 'A criatura equipada recebe +1/+1.'),
      triggered(on.attacks((c, id) => c.g.state.objects[c.source]?.attachedTo === id), function* (c) { yield* maySearchBasicToBattlefield(c, c.you, true); },
        { text: 'Sempre que a criatura equipada ataca, você pode procurar uma carta de terreno básico, colocá-la no campo virada e embaralhar.' }),
      equip('{3}'),
    ],
  }],
  rulings: {},
});
