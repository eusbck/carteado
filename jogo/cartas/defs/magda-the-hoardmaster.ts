// Magda, the Hoardmaster
// Whenever you commit a crime, create a tapped Treasure token. This ability triggers only once each turn.
// (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)
// Sacrifice three Treasures: Create a 4/4 red Scorpion Dragon creature token with flying and haste.
// Activate only as a sorcery.
import { activated, chars, createTokens, defineCard, onYouCommitCrime, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Magda, the Hoardmaster',
  faces: [{ abilities: [
    triggered(onYouCommitCrime(), function* (c) {
      yield* createTokens(c.g, c.you, 'Treasure', 1, { tapped: true });
    }, { oncePerTurn: true, text: 'Sempre que você comete um crime, crie uma ficha de Tesouro virada. Esta habilidade só dispara uma vez por turno.' }),
    activated([{
      k: 'sacrifice', n: 3, label: 'Tesouro', filter: (c, id) => {
        const ch = chars(c.g, id);
        return ch.types.includes('Artifact') && ch.subtypes.includes('Treasure');
      },
    }], function* (c) {
      yield* createTokens(c.g, c.you, 'Scorpion Dragon', 1);
    }, { timing: 'sorcery', text: 'Sacrifique três Tesouros: Crie uma ficha de criatura Escorpião Dragão vermelha 4/4 com voar e ímpeto. Ative somente como feitiço.' }),
  ] }],
  rulings: {
    1: 'teste: mirar uma criatura alheia é crime e mirar uma criatura sua não é',
    2: 'teste: cria o Tesouro antes de a mágica criminosa resolver e só dispara uma vez no turno',
    3: 'regra geral: CR 603.3b — o controlador ordena seus gatilhos simultâneos (motor/triggers.ts)',
    4: 'regra geral: CR 700.13 — um crime por mágica ou habilidade, independentemente do número de alvos (motor/crime.ts)',
    5: 'regra geral: CR 700.13 — mudar alvos depois não comete um crime (motor/crime.ts)',
  },
});
