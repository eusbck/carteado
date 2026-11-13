// Kíli the Resourceful
// Storied (If you control three or more artifacts, legendaries, and/or Sagas, you have an enduring story for the rest
// of the game.)
// As long as you have an enduring story, you may pay {0} rather than pay the equip cost of the first equip ability
// you activate each turn.
// Whenever another Dwarf or Equipment you control enters, draw a card. This ability triggers only once each turn.
import { and, defineCard, draw, is, on, or, staticAbility, storied, temHistoriaDuradoura, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Kíli the Resourceful',
  faces: [{
    abilities: [
      // CR 702.195 (motor/historia.ts): rulings 1-6
      ...storied(),
      staticAbility({
        rules: { equipForZero: (c, jogador) => jogador === c.you && temHistoriaDuradoura(c.g, c.you) },
        text: 'Enquanto você tiver uma história duradoura, você pode pagar {0} em vez do custo de equipar da primeira habilidade de equipar que você ativar em cada turno.',
      }),
      triggered(on.enters(and(is.yours, is.other, or(is.subtype('Dwarf'), is.subtype('Equipment')))), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { oncePerTurn: true, text: 'Sempre que outro Dwarf ou Equipamento que você controla entra, compre uma carta. Esta habilidade dispara somente uma vez a cada turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.195a — o histórico é conferido junto com as ações baseadas em estado, logo que a terceira permanente entra (motor/historia.ts; a regra da lenda, conferida no mesmo momento, vem antes)',
    2: 'teste: CR 702.195a — com três artefatos, lendárias e/ou Sagas, você ganha a história duradoura sem pilha',
    3: 'teste: uma lendária que também é artefato conta uma vez só',
    4: 'teste: CR 702.195a — com três artefatos, lendárias e/ou Sagas, você ganha a história duradoura sem pilha',
    5: 'teste: CR 702.195b — a história duradoura fica pelo resto da partida, mesmo sem Kíli e sem as permanentes',
    6: 'regra geral: CR 702.195a — só quem controla uma permanente com histórico ganha a designação (motor/historia.ts)',
  },
});
