// Pit of Offerings
// This land enters tapped.
// When this land enters, exile up to three target cards from graveyards.
// {T}: Add {C}.
// {T}: Add one mana of any of the exiled cards' colors.
import { chars, defineCard, etb, exile, land, linkedExiled, mana, t, tgtsAll, upTo } from '../../motor/api.ts';

const CHAVE = 'ofertas';

export default defineCard({
  name: 'Pit of Offerings',
  faces: [{
    abilities: [
      land.tapped(),
      etb(function* (c) {
        yield* exile(c.g, tgtsAll(c), { linkTo: { obj: c.source, key: CHAVE } });
      }, { targets: [upTo(3, t.card('graveyard', undefined, 'até três cartas alvo de cemitérios', 'any'))], text: 'Quando este terreno entra, exile até três cartas alvo de cemitérios.' }),
      mana('C'),
      mana((c) => {
        // CR 105.1, 607.2a: incolor não é uma cor; só as cartas ainda exiladas com esta fonte contam.
        const cores = new Set(linkedExiled(c.g, c.source, CHAVE).flatMap((id) => chars(c.g, id).colors));
        return [...cores].map((cor) => [cor]);
      }, { text: '{T}: Adicione uma mana de qualquer uma das cores das cartas exiladas.' }),
    ],
  }],
  rulings: {
    1: 'teste: a habilidade das cartas exiladas oferece só cores e nunca mana incolor',
    2: 'teste: sem cartas exiladas, a última habilidade não produz mana',
  },
});
