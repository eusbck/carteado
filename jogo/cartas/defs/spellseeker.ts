// Spellseeker
// When this creature enters, you may search your library for an instant or sorcery card with mana value 2 or less,
// reveal it, put it into your hand, then shuffle.
import { chars, defineCard, etb, manaValue, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Spellseeker',
  faces: [{
    abilities: [
      etb(function* (c) {
        // "você pode procurar": a busca pode terminar sem nada (CR 701.23d); ruling 1: X no grimório vale 0 (CR 202.3e)
        yield* searchTo(c, c.you, (id) => { const ch = chars(c.g, id); return (ch.types.includes('Instant') || ch.types.includes('Sorcery')) && manaValue(c.g, id) <= 2; }, 1, 'hand', { reveal: true, prompt: 'Procure uma carta de instantânea ou feitiço com valor de mana 2 ou menos' });
      }, { text: 'Quando esta criatura entra, você pode procurar uma carta de instantânea ou feitiço com valor de mana 2 ou menos, revelá-la e pô-la na sua mão; depois embaralhe.' }),
    ],
  }],
  rulings: { 1: 'teste: uma carta com {X} no custo vale 0 no grimório e pode ser achada' },
});
