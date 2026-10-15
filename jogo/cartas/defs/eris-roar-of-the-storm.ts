// Eris, Roar of the Storm
// This spell costs {2} less to cast for each different mana value among instant and sorcery cards in your graveyard.
// Flying, prowess
// Whenever you cast your second spell each turn, create a 4/4 red Dragon Elemental creature token with flying and
// prowess.
import { createTokens, defineCard, keyword, prowess, triggered } from '../../motor/api.ts';
import { segundaMagicaDoTurno, valoresDeManaDiferentes } from '../saque.ts';

export default defineCard({
  name: 'Eris, Roar of the Storm',
  faces: [{
    // CR 601.2f: reduz só o genérico; rulings 1-3: valor de mana da carta no cemitério (dividida soma as metades, X é 0)
    selfCost: (c) => ({ reduce: 2 * valoresDeManaDiferentes(c.g, c.you) }),
    abilities: [
      keyword('flying'),
      ...prowess(),
      // ruling 4: as mágicas conjuradas antes de ela entrar contam
      triggered(segundaMagicaDoTurno(), function* (c) {
        yield* createTokens(c.g, c.you, 'Dragon Elemental', 1);
      }, { text: 'Sempre que você conjura a sua segunda mágica em cada turno, crie uma ficha de criatura Dragon Elemental 4/4 vermelha com voar e bravura.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 709.4 — a carta dividida no cemitério tem o valor de mana das duas metades (motor/chars.ts)',
    2: 'regra geral: CR 712.8a — a carta de duas faces no cemitério tem o valor de mana da frente (motor/chars.ts)',
    3: 'regra geral: CR 202.3e — fora da pilha, X vale 0 (motor/chars.ts)',
    4: 'teste: conjurada como segunda mágica do turno, a próxima é a terceira e não dispara; antes disso, a segunda dispara',
  },
});
