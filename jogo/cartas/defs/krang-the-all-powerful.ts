// Krang, the All-Powerful
// If a player drawing a card causes a triggered ability of a permanent you control to trigger, that ability triggers an
// additional time.
// Whenever a player draws their second card each turn, put a +1/+1 counter on Krang.
import { addCounters, controllerOf, defineCard, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Krang, the All-Powerful',
  faces: [{
    abilities: [
      // ruling 2: não copia a habilidade, ela dispara de novo; as escolhas são feitas para cada instância
      staticAbility({
        rules: {
          extraTriggers: (c, tr) => (tr.cause?.type === 'draw' && c.g.state.objects[tr.source]?.zone === 'battlefield' && controllerOf(c.g, tr.source) === c.you ? 1 : 0),
        },
        text: 'Se um jogador comprar uma carta fizer disparar uma habilidade de uma permanente que você controla, essa habilidade dispara uma vez a mais.',
      }),
      triggered(on.custom((e, c) => e.type === 'draw' && c.g.state.turnStats[e.player].cardsDrawn === 2), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que um jogador compra a segunda carta dele em cada turno, coloque um marcador +1/+1 em Krang.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.1 — habilidades desencadeadas são as de "quando", "sempre que" e "no início" (motor/triggers.ts)',
    2: 'teste: as habilidades das suas permanentes que disparam por uma compra disparam uma vez a mais, inclusive a do próprio Krang',
    3: 'regra geral: CR 607.2 — as instâncias a mais continuam ligadas à mesma segunda habilidade (motor/triggers.ts)',
  },
});