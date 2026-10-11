// Crib Swap
// Changeling (This card is every creature type.)
// Exile target creature. Its controller creates a 1/1 colorless Shapeshifter creature token with changeling.
import { changeling, controllerOf, createTokens, defineCard, exile, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Crib Swap',
  faces: [{
    // CR 702.73a: habilidade que define característica, vale em todas as zonas (a carta é Kindred, CR 308.1)
    abilities: [changeling()],
    spell: {
      targets: [t.creature()],
      *effect(c) {
        // ruling 10: com o alvo ilegal a mágica não resolve e ninguém cria a ficha
        const id = tgt(c);
        if (id === null) return;
        const quem = controllerOf(c.g, id);
        yield* exile(c.g, [id]);
        yield* createTokens(c.g, quem, 'Shapeshifter', 1);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 308.1 — Kindred dá tipos de criatura a uma carta que não é de criatura (motor/chars.ts)',
    2: 'regra geral: CR 308.1 — Kindred é um tipo de carta e conta como tal',
    3: 'regra geral: CR 702.73a — a carta com polimorfo é de todos os tipos de criatura (motor/criaturas.ts changeling)',
    4: 'teste: polimorfo vale em todas as zonas: na mão, a carta é de todos os tipos de criatura',
    5: 'regra geral: CR 613.1d — um efeito que troca o tipo de criatura passa por cima do polimorfo, que vem antes na camada 4',
    6: 'regra geral: CR 308.1 — "tribal" virou "kindred", sem mudar o funcionamento',
    7: 'regra geral: CR 613.1d — perder as habilidades (camada 6) não desfaz os tipos dados na camada 4',
    8: 'regra geral: CR 308.1 — Kindred dá tipos de criatura a uma carta que não é de criatura (motor/chars.ts)',
    9: 'regra geral: CR 308.1 — "tribal" virou "kindred", sem mudar o funcionamento',
    10: 'teste: com o alvo ilegal, ninguém cria a ficha',
    11: 'teste: polimorfo vale em todas as zonas: na mão, a carta é de todos os tipos de criatura',
    12: 'regra geral: CR 308.1 — Kindred é tipo de carta, não supertipo',
  },
});
