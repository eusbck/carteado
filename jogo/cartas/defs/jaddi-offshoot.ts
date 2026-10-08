// Jaddi Offshoot
// Defender
// Landfall — Whenever a land you control enters, you gain 1 life.
import { defineCard, gainLife, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Jaddi Offshoot',
  faces: [{
    abilities: [
      keyword('defender'),
      triggered(on.landfall(), function* (c) { gainLife(c.g, c.you, 1, c.source); }, { text: 'Queda de terreno — Sempre que um terreno que você controla entra, você ganha 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.3b — o controlador ordena os próprios gatilhos',
    2: 'teste: dispara jogando terreno ou colocando-o no campo por efeito',
    3: 'não se aplica: nenhuma carta dos decks transforma um permanente em terreno',
  },
});
