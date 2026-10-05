// Hardened Academic
// Flying, haste
// Discard a card: This creature gains lifelink until end of turn.
// Whenever one or more cards leave your graveyard, put a +1/+1 counter on target creature you control.
import { activated, addCounters, defineCard, is, keywords, on, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Hardened Academic',
  faces: [{
    abilities: [
      ...keywords('flying', 'haste'),
      activated('Discard a card', function* (c) {
        if (c.g.state.objects[c.source]) untilEndOfTurn(c, [c.source], [{ k: 'addKeyword', kw: 'lifelink' }]);
      }, { text: 'Descarte uma carta: Esta criatura ganha vínculo com a vida até o fim do turno.' }),
      // ruling 1: várias cartas ao mesmo tempo disparam uma vez só
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'zone' && e.from === 'graveyard' && e.owner === c.you)), function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: 'Sempre que uma ou mais cartas saem do seu cemitério, coloque um marcador +1/+1 na criatura alvo que você controla.' }),
    ],
  }],
  rulings: { 1: 'teste: várias cartas ao mesmo tempo disparam uma vez só' },
});
