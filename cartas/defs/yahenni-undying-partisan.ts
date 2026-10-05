// Yahenni, Undying Partisan
// Haste
// Whenever a creature an opponent controls dies, put a +1/+1 counter on Yahenni.
// Sacrifice another creature: Yahenni gains indestructible until end of turn.
import { activated, addCounters, defineCard, keyword, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Yahenni, Undying Partisan',
  faces: [{
    abilities: [
      keyword('haste'),
      // ruling 1: morrendo junto, Yahenni não está no campo para receber o marcador
      triggered(on.dies((c, l) => c.g.isOpponent(c.you, l.controller)), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que uma criatura que um oponente controla morre, coloque um marcador +1/+1 em Yahenni.' }),
      activated('Sacrifice another creature', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'addKeyword', kw: 'indestructible' }]);
      }, { text: 'Sacrifique outra criatura: Yahenni ganha indestrutível até o fim do turno.' }),
    ],
  }],
  rulings: { 1: 'teste: morrendo junto, não é salva pelo marcador' },
});
