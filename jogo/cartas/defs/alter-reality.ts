// Alter Reality
// Change the text of target spell or permanent by replacing all instances of one color word with another. (This effect
// lasts indefinitely.)
// Flashback {1}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { defineCard, flashback, tgt } from '../../motor/api.ts';
import { trocaTexto } from '../twitch.ts';

export default defineCard({
  name: 'Alter Reality',
  faces: [{
    // CR 702.34a: do cemitério pelo custo de retrospectiva; depois vai para o exílio
    altCosts: [flashback('{1}{U}')],
    spell: {
      targets: [{ what: 'spellOrPermanent', label: 'mágica ou permanente alvo' }],
      *effect(c) {
        // CR 612.2 (motor/chars.ts): as palavras são escolhidas na resolução; a troca vale no texto e na linha de tipo
        const id = tgt(c);
        if (id !== null) yield* trocaTexto(c, id, ['color'], { kind: 'permanent' }, 'Alter Reality');
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.34a — retrospectiva: do cemitério pelo custo, e depois vai para o exílio (motor/stack.ts)',
    2: 'regra geral: CR 702.34a — segue o tempo normal do tipo da carta (motor/priority.ts)',
    3: 'regra geral: CR 601.2f — custo total a partir do custo de retrospectiva (motor/stack.ts totalSpellCost)',
    4: 'teste: conjurada por retrospectiva, vai para o exílio',
    5: 'regra geral: CR 702.34a — vale para carta posta no cemitério sem ter sido conjurada',
    6: 'regra geral: CR 117.3b — o jogador ativo recebe a prioridade primeiro (motor/priority.ts)',
    7: 'teste: a palavra de cor é escolhida na resolução e a troca não acaba no fim do turno',
    8: 'regra geral: CR 612 — a troca na mágica de permanente continua no permanente (motor/stack.ts carryToPermanent; teste em Crystal Spray)',
    9: 'regra geral: CR 612.1 — troca no texto e na linha de tipo (motor/chars.ts)',
    10: 'regra geral: CR 612.2 — sem a palavra, nada muda (motor/chars.ts)',
    11: 'regra geral: CR 612.2 — a palavra nova não pode ser a mesma (cartas/twitch.ts trocaTexto)',
    12: 'regra geral: CR 612.3 — o que outros efeitos concedem não muda (motor/chars.ts, camada 3)',
    13: 'regra geral: CR 601.2c — os alvos já escolhidos não mudam (motor/stack.ts)',
  },
});
