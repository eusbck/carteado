// Exemplar of Light
// Flying
// Whenever you gain life, put a +1/+1 counter on this creature.
// Whenever you put one or more +1/+1 counters on this creature, draw a card. This ability triggers only once each turn.
import { addCounters, defineCard, draw, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Exemplar of Light',
  faces: [{
    abilities: [
      keyword('flying'),
      // rulings 1, 3-4: uma vez por evento de ganhar vida
      triggered(on.youGainLife(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que você ganha vida, coloque um marcador +1/+1 nesta criatura.' }),
      // ruling 6: por qualquer motivo, se foi você quem pôs os marcadores
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'counters' && e.kind === '+1/+1' && e.amount > 0 && e.target.kind === 'obj' && e.target.id === c.source && e.by === c.you)), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { oncePerTurn: true, text: 'Sempre que você coloca um ou mais marcadores +1/+1 nesta criatura, compre uma carta. Esta habilidade só dispara uma vez a cada turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: cada evento de ganhar vida dá um marcador; a compra dispara só uma vez por turno',
    2: 'regra geral: CR 704.3 — o marcador vem depois das ações de estado; não salva do dano letal simultâneo',
    3: 'regra geral: CR 119.10 — cada criatura com vínculo com a vida é um evento separado (motor/actions.ts dealDamage)',
    4: 'regra geral: CR 119.9 — "para cada" é um evento só de ganhar vida',
    5: 'não se aplica: não há partidas de Dois Gigantes',
    6: 'teste: marcadores postos por outro efeito seu também fazem comprar',
  },
});
