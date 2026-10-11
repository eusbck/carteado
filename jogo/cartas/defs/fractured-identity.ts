// Fractured Identity
// Exile target nonland permanent. Each player other than its controller creates a token that's a copy of it.
import { controllerOf, copiableValues, createTokens, defineCard, exile, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Fractured Identity',
  faces: [{
    spell: {
      targets: [t.nonlandPermanent()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const controlador = controllerOf(c.g, id);
        // rulings 1-4: só os valores copiáveis (o que estava impresso, ou o que a permanente copiava), com X = 0
        const valores = copiableValues(c.g, id);
        yield* exile(c.g, [id]);
        // ruling 6: as fichas não são comandantes (a ficha não é a carta)
        for (const p of c.g.apnap().filter((q) => q !== controlador)) yield* createTokens(c.g, p, { copyOf: valores }, 1);
      },
    },
  }],
  rulings: {
    1: 'teste: exila a permanente, e cada outro jogador cria uma cópia sem os marcadores dela',
    2: 'regra geral: CR 107.3g — fora da pilha, o X do custo de mana conta 0 (motor/chars.ts)',
    3: 'regra geral: CR 707.3 — a cópia de uma cópia usa os valores copiáveis dela (motor/mecanicas.ts copiableValues)',
    4: 'regra geral: CR 707.3 — a cópia de uma ficha usa as características que o efeito que a criou definiu (motor/mecanicas.ts copiableValues)',
    5: 'teste: as habilidades de entrar da permanente copiada disparam para cada ficha',
    6: 'regra geral: CR 903.3 — ser comandante é da carta, não um valor copiável (motor/types.ts CardInst.isCommander)',
  },
});
