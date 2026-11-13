// Glamerdye
// Change the text of target spell or permanent by replacing all instances of one color word with another.
// Retrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)
import { defineCard, retrace, tgt } from '../../motor/api.ts';
import { trocaTexto } from '../twitch.ts';

const retracar = retrace();

export default defineCard({
  name: 'Glamerdye',
  faces: [{
    // CR 702.81a: do cemitério descartando uma carta de terreno além dos outros custos
    altCosts: [retracar.altCost],
    abilities: [retracar.ability],
    spell: {
      targets: [{ what: 'spellOrPermanent', label: 'mágica ou permanente alvo' }],
      *effect(c) {
        // CR 612.2 (motor/chars.ts): as palavras são escolhidas na resolução; a troca vale no texto e na linha de tipo
        const id = tgt(c);
        if (id !== null) yield* trocaTexto(c, id, ['color'], { kind: 'permanent' }, 'Glamerdye');
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.81a — retraçar segue o tempo normal do tipo da carta (motor/conjurar-alternativo.ts)',
    2: 'teste: do cemitério, descartando uma carta de terreno, e volta para o cemitério',
    3: 'teste: do cemitério, descartando uma carta de terreno, e volta para o cemitério',
    4: 'regra geral: CR 117.3b — o jogador ativo recebe a prioridade primeiro (motor/priority.ts)',
    5: 'teste: troca a cor da proteção de uma criatura, sem prazo',
    6: 'regra geral: CR 612.2 — escolhidas na resolução, e a nova não pode ser a mesma (cartas/twitch.ts trocaTexto)',
    7: 'regra geral: CR 612.2 — nomes e símbolos de mana não mudam (motor/chars.ts)',
    8: 'regra geral: CR 612.2 — a cor nos parâmetros de palavra-chave muda onde for usada como cor (motor/chars.ts)',
    9: 'regra geral: CR 612.3 — o que outros efeitos concedem não muda (motor/chars.ts, camada 3)',
    10: 'não se aplica: o medo (fear) não é palavra-chave com cor no motor e a troca não o alcança',
  },
});
