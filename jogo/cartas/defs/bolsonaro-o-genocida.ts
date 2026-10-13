// Bolsonaro, o Genocida (carta própria da mesa)
// Menace
// Whenever Bolsonaro attacks, destroy the creature with the least toughness defending player controls. If two or more
// creatures are tied, you choose one of them.
// Whenever a creature an opponent controls dies, you gain 2 life and put a +1/+1 counter on Bolsonaro.
import { addCounters, chooseItems, creaturesOf, defineCard, destroy, gainLife, keyword, nameOf, objItem, on, toughness, triggered } from '../../motor/api.ts';
import { defensorDe } from '../brasil.ts';

export default defineCard({
  name: 'Bolsonaro, o Genocida',
  faces: [{
    abilities: [
      keyword('menace'),
      // não tem alvo: a criatura é achada na resolução (resistência à magia e proteção não a salvam)
      triggered(on.selfAttacks(), function* (c) {
        const g = c.g;
        const defensor = defensorDe(g, c.source);
        if (defensor === null) return;
        const criaturas = creaturesOf(g, defensor);
        if (!criaturas.length) return;
        const menor = Math.min(...criaturas.map((id) => toughness(g, id)));
        const empatadas = criaturas.filter((id) => toughness(g, id) === menor);
        let escolhida = empatadas[0];
        if (empatadas.length > 1) {
          const [x] = yield* chooseItems(g, c.you, 'Bolsonaro: escolha a criatura com a menor resistência para destruir', empatadas.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
          escolhida = Number(x);
        }
        yield* destroy(g, [escolhida]);
      }, { text: 'Sempre que Bolsonaro ataca, destrua a criatura com a menor resistência que o jogador defensor controla. Se houver empate, você escolhe uma delas.' }),
      triggered(on.dies((c, lki) => c.g.isOpponent(c.you, lki.controller)), function* (c) {
        gainLife(c.g, c.you, 2, c.source);
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que uma criatura que um oponente controla morre, você ganha 2 pontos de vida e coloca um marcador +1/+1 em Bolsonaro.' }),
    ],
  }],
  rulings: {},
});
