// Quantum Misalignment
// Create a token that's a copy of target creature you control, except it isn't legendary.
// Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may
// cast this card from exile without paying its mana cost.)
import { copyWithExcept, createTokens, defineCard, is, rebound, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Quantum Misalignment',
  faces: [{
    // CR 702.88a
    abilities: [rebound()],
    spell: {
      targets: [t.creature(is.yours, 'criatura alvo que você controla')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        // CR 707.2, 707.9b: os valores copiáveis da criatura, com a exceção "não é lendária" fazendo parte da cópia
        yield* createTokens(c.g, c.you, { copyOf: copyWithExcept(c.g, id, { legendary: false }) }, 1);
      },
    },
  }],
  rulings: {
    1: 'teste: a ficha copia o que está impresso, sem marcadores, e não é lendária',
    2: 'regra geral: CR 107.3 — X de uma cópia de permanente vale 0 (motor/chars.ts copiableValues)',
    3: 'regra geral: CR 707.2 — copiando uma ficha, valem as características dadas pelo efeito que a criou (motor/mecanicas.ts copiableValues)',
    4: 'regra geral: CR 707.3 — copiando uma cópia, a ficha entra como o que a criatura copiava (motor/mecanicas.ts copiableValues)',
    5: 'teste: as habilidades de entrar da criatura copiada disparam para a ficha',
  },
});
