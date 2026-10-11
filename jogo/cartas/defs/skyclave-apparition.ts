// Skyclave Apparition
// When this creature enters, exile up to one target nonland, nontoken permanent you don't control with mana value 4 or
// less.
// When this creature leaves the battlefield, the exiled card's owner creates an X/X blue Illusion creature token, where X
// is the mana value of the exiled card.
import { and, createTokens, defineCard, etb, exile, is, linkedExiled, manaValue, not, on, t, tgt, triggered, upTo } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

const CHAVE = 'aparicao';

export default defineCard({
  name: 'Skyclave Apparition',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // ruling 3: exila mesmo que Skyclave Apparition já tenha saído do campo (aí a carta fica sem ligação)
        yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
      }, {
        // ruling 2: no campo, o X do custo de mana conta 0
        targets: [upTo(1, t.permanent(and(is.nonland, is.nontoken, not(is.yours), is.mvAtMost(4)), 'permanente alvo que não é terreno nem ficha, que você não controla, com valor de mana 4 ou menos'))],
        text: 'Quando esta criatura entra, exile até uma permanente alvo que não é terreno nem ficha, que você não controla, com valor de mana 4 ou menos.',
      }),
      triggered(on.selfLeaves(), function* (c) {
        const s = c.g.state;
        // ruling 1: sem carta exilada, ninguém cria ficha
        const exiladas = linkedExiled(c.g, c.source, CHAVE);
        if (!exiladas.length) return;
        // ruling 4: cada dono cria uma ficha com a soma dos valores de mana de todas as cartas exiladas
        const x = exiladas.reduce((n, id) => n + manaValue(c.g, id), 0);
        const donos = [...new Set(exiladas.map((id) => s.objects[id].owner))];
        for (const p of c.g.apnap().filter((q: PlayerId) => donos.includes(q))) {
          yield* createTokens(c.g, p, { copyOf: { def: 'Illusion X/X', face: 0, except: { power: x, toughness: x } } }, 1);
        }
      }, { text: 'Quando esta criatura sai do campo, o dono da carta exilada cria uma ficha de criatura Illusion azul X/X, onde X é o valor de mana da carta exilada.' }),
    ],
  }],
  rulings: {
    1: 'teste: sem carta exilada, ninguém cria ficha quando ela sai do campo',
    2: 'regra geral: CR 107.3g — fora da pilha, o X do custo de mana conta 0 (motor/chars.ts manaValue)',
    3: 'regra geral: CR 113.7a — na pilha, a habilidade não depende mais da fonte: exila mesmo que ela tenha saído do campo (motor/stack.ts)',
    4: 'regra geral: CR 607.2a — a ficha usa a soma dos valores de mana das cartas exiladas com ela (cartas/defs/skyclave-apparition.ts)',
  },
});
