// Crystal Spray
// Change the text of target spell or permanent by replacing all instances of one color word with another or one basic
// land type with another until end of turn.
// Draw a card.
import { defineCard, draw, tgt } from '../../motor/api.ts';
import { trocaTexto } from '../twitch.ts';

export default defineCard({
  name: 'Crystal Spray',
  faces: [{
    spell: {
      targets: [{ what: 'spellOrPermanent', label: 'mágica ou permanente alvo' }],
      *effect(c) {
        // CR 612.2 (motor/chars.ts): as palavras são escolhidas na resolução; a troca vale no texto e na linha de tipo
        const id = tgt(c);
        if (id !== null) yield* trocaTexto(c, id, ['color', 'landType'], { kind: 'endOfTurn' }, 'Crystal Spray');
        yield* draw(c.g, c.you, 1);
      },
    },
  }],
  rulings: {
    1: 'teste: num Forest, Forest vira Island na linha de tipo e ele passa a produzir {U}',
    2: 'regra geral: CR 612.2 — pode mirar qualquer mágica ou permanente; sem a palavra, nada muda (motor/chars.ts)',
    3: 'teste: a palavra nova não pode ser a mesma (não é oferecida)',
    4: 'regra geral: CR 612.3 — a troca é na camada 3; o que outros efeitos concedem vem depois e não muda (motor/chars.ts)',
    5: 'teste: as palavras são escolhidas na resolução',
    6: 'regra geral: CR 612.2 — nomes não mudam (motor/chars.ts só troca subtipos e parâmetros de palavra-chave)',
    7: 'regra geral: CR 601.2c — os alvos já escolhidos não mudam com a troca de texto (motor/stack.ts)',
    8: 'teste: a troca na mágica de criatura continua no permanente em que ela vira',
    9: 'teste: num Forest, Forest vira Island na linha de tipo e ele passa a produzir {U}',
  },
});
