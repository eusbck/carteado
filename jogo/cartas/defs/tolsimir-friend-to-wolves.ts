// Tolsimir, Friend to Wolves
// When Tolsimir enters, create Voja, Friend to Elves, a legendary 3/3 green and white Wolf creature token.
// Whenever a Wolf you control enters, you gain 3 life and that creature fights up to one target creature you don't
// control.
import { and, controllerOf, createTokens, defineCard, etb, gainLife, is, on, t, tgt, triggered, upTo } from '../../motor/api.ts';
import { luta } from '../wakanda.ts';

export default defineCard({
  name: 'Tolsimir, Friend to Wolves',
  faces: [{
    abilities: [
      etb(function* (c) {
        yield* createTokens(c.g, c.you, 'Voja, Friend to Elves', 1);
      }, { text: 'Quando Tolsimir entra, crie Voja, Friend to Elves, uma ficha de criatura Lobo lendária 3/3 verde e branca.' }),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && is.creature(c, e.obj)
        && is.subtype('Wolf')(c, e.obj) && controllerOf(c.g, e.obj) === c.you ? { lobo: e.obj } : false)), function* (c) {
        gainLife(c.g, c.you, 3, c.source);
        // ruling 3: sem o Lobo no campo, ninguém luta (luta confere as duas no campo, CR 701.14b)
        const alvo = tgt(c);
        if (alvo !== null) luta(c.g, c.event.lobo as number, alvo);
      }, {
        targets: [upTo(1, t.creature(and((c, id) => controllerOf(c.g, id) !== c.you), 'até uma criatura alvo que você não controla'))],
        text: 'Sempre que um Lobo que você controla entra, você ganha 3 pontos de vida e essa criatura luta com até uma criatura alvo que você não controla.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: Voja entra e dispara o gatilho de Lobo: ganha 3 de vida e luta',
    2: 'teste: sem alvo, só ganha 3 de vida',
    3: 'regra geral: CR 701.14b — se o Lobo saiu do campo, ninguém causa nem recebe dano (cartas/wakanda.ts luta)',
    4: 'regra geral: CR 704.5j — a regra das lendas olha só o nome; Voja, Friend to Elves e Voja são nomes diferentes (motor/sba.ts)',
  },
});
