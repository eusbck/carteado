// Fellwar Stone
// {T}: Add one mana of any color that a land an opponent controls could produce.
import { defineCard, mana, opponentLandColors } from '../../motor/api.ts';

export default defineCard({
  name: 'Fellwar Stone',
  faces: [{
    abilities: [mana((c) => opponentLandColors(c.g, c.you).map((t) => [t]), { text: '{T}: Adicione uma mana de qualquer cor que um terreno de um oponente poderia produzir.' })],
  }],
  rulings: {
    1: 'teste: produz uma mana só, das cores dos terrenos dos oponentes',
    2: 'teste: vale mesmo com os terrenos do oponente virados',
    3: 'regra geral: CR 106.5 — sem cores possíveis, não produz mana (opponentLandColors vazio)',
    4: 'regra geral: CR 106.7 — só importam as cores, não restrições',
    5: 'não se aplica: nenhuma carta dos decks substitui a mana produzida por terrenos',
    6: 'regra geral: CR 106.7 — couldProduce olha as habilidades de mana sem checar custos (testado em Exotic Orchard)',
    7: 'teste: nunca produz incolor',
  },
});
