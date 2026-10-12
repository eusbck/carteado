// Basim Ibn Ishaq
// Whenever you cast a historic spell, draw a card. Basim Ibn Ishaq can't be blocked this turn. This ability triggers only
// once each turn. (Artifacts, legendaries, and Sagas are historic.)
// Whenever Basim Ibn Ishaq deals combat damage to a player, put a +1/+1 counter on it.
import { addCounters, defineCard, draw, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { ehHistorica } from '../jin.ts';

export default defineCard({
  name: 'Basim Ibn Ishaq',
  faces: [{
    abilities: [
      triggered(on.youCast((c, id) => ehHistorica(c.g, id)), function* (c) {
        yield* draw(c.g, c.you, 1);
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'rule', id: 'rule:cantBeBlocked' }]);
      }, { oncePerTurn: true, text: 'Sempre que você conjura uma mágica histórica, compre uma carta. Basim Ibn Ishaq não pode ser bloqueado neste turno. Esta habilidade dispara apenas uma vez por turno. (Artefatos, lendárias e Sagas são históricas.)' }),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que Basim Ibn Ishaq causa dano de combate a um jogador, coloque um marcador +1/+1 nele.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 700.6 — histórica é a que é lendária, artefato ou Saga; ter mais de uma dessas qualidades não muda nada (cartas/jin.ts ehHistorica)',
    2: 'regra geral: CR 603.3 — o gatilho de conjurar vai para a pilha acima da mágica e resolve antes dela, mesmo que ela seja anulada (motor/stack.ts)',
    3: 'teste: a primeira mágica histórica do turno compra uma carta e deixa Basim sem poder ser bloqueado; a segunda, não',
    4: 'regra geral: CR 305.1 — terrenos não são conjurados: jogar um terreno lendário não dispara (motor/priority.ts)',
  },
});