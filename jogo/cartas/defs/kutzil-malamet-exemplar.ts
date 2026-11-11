// Kutzil, Malamet Exemplar
// Your opponents can't cast spells during your turn.
// Whenever one or more creatures you control each with power greater than its base power deals combat damage to a
// player, draw a card.
import { basePower, defineCard, draw, power, staticAbility, triggered } from '../../motor/api.ts';
import { seusCausamDanoDeCombate } from '../gatos.ts';

export default defineCard({
  name: 'Kutzil, Malamet Exemplar',
  faces: [{
    abilities: [
      staticAbility({
        rules: { cantCastSpells: (c, p) => c.g.state.turn.active === c.you && c.g.isOpponent(c.you, p) },
        text: 'Seus oponentes não podem conjurar mágicas durante o seu turno.',
      }),
      // rulings 1-3: a força-base é a impressa (ou a da ficha), a da CDA ou a definida por um efeito (camadas 7a-7b);
      // um gatilho por jogador que tomou o dano
      triggered(seusCausamDanoDeCombate((c, id) => power(c.g, id) > basePower(c.g, id)), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que uma ou mais criaturas que você controla, cada uma com força maior que a força-base dela, causam dano de combate a um jogador, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: força aumentada por marcador ou efeito conta; força definida por efeito vira a base e não conta',
    2: 'teste: a CDA define a força-base: a criatura */* sem aumento não conta',
    3: 'teste: a criatura 0/0 que recebe bônus de uma habilidade (sem CDA) tem força maior que a base',
  },
});
