// Extinction Event
// Choose odd or even. Exile each creature with mana value of the chosen quality. (Zero is even.)
import { allCreatures, chooseItems, defineCard, exile, manaValue } from '../../motor/api.ts';

export default defineCard({
  name: 'Extinction Event',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: escolhido na resolução, sem respostas no meio
        const [esc] = yield* chooseItems(c.g, c.you, 'Extinction Event: escolha ímpar ou par', [{ id: 'impar', label: 'Ímpar' }, { id: 'par', label: 'Par (zero é par)' }], 1, 1);
        const resto = esc === 'impar' ? 1 : 0;
        // rulings 2-3: X vale 0 no campo; ficha que não é cópia tem valor de mana 0
        const ids = allCreatures(c.g).filter((id) => manaValue(c.g, id) % 2 === resto);
        if (ids.length) yield* exile(c.g, ids);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2 — a escolha é feita na resolução, sem respostas no meio',
    2: 'regra geral: CR 202.3e — X vale 0 no campo (motor/chars.ts manaValue)',
    3: 'teste: par exila as criaturas de valor de mana par, fichas inclusive (valor 0); ímpar, as de valor ímpar',
  },
});
