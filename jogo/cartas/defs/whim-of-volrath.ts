// Whim of Volrath
// Buyback {2} (You may pay an additional {2} as you cast this spell. If you do, put this card into your hand as it
// resolves.)
// Change the text of target permanent by replacing all instances of one color word with another or one basic land type
// with another until end of turn. (For example, you may change "nonred creature" to "nongreen creature" or "plainswalk"
// to "swampwalk.")
import { buyback, defineCard, t, tgt } from '../../motor/api.ts';
import { trocaTexto } from '../twitch.ts';

export default defineCard({
  name: 'Whim of Volrath',
  faces: [{
    // CR 702.27a: com a recompra paga, volta para a mão ao resolver
    additionalCosts: [buyback('{2}')],
    spell: {
      targets: [t.permanent()],
      *effect(c) {
        // CR 612.2 (motor/chars.ts): as palavras são escolhidas na resolução; a troca vale no texto e na linha de tipo
        const id = tgt(c);
        if (id !== null) yield* trocaTexto(c, id, ['color', 'landType'], { kind: 'endOfTurn' }, 'Whim of Volrath');
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 612.2 — pode mirar qualquer permanente; sem a palavra, nada muda (motor/chars.ts)',
    2: 'regra geral: CR 612.2 — a palavra nova não pode ser a mesma (cartas/twitch.ts trocaTexto)',
    3: 'teste: troca o tipo básico de terreno de uma Island até o fim do turno',
    4: 'regra geral: CR 612.3 — o que outros efeitos concedem não muda (motor/chars.ts, camada 3)',
    5: 'teste: troca o tipo básico de terreno de uma Island até o fim do turno',
    6: 'regra geral: CR 612.2 — nomes não mudam (motor/chars.ts)',
    7: 'teste: troca o tipo básico de terreno de uma Island até o fim do turno',
  },
});
