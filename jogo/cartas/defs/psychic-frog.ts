// Psychic Frog
// Whenever this creature deals combat damage to a player or planeswalker, draw a card.
// Discard a card: Put a +1/+1 counter on this creature.
// Exile three cards from your graveyard: This creature gains flying until end of turn.
import { activated, addCounters, defineCard, draw, isType, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Psychic Frog',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => e.type === 'damage' && e.combat && e.source === c.source && (e.target.kind === 'player' || (!!c.g.state.objects[e.target.id] && isType(c.g, e.target.id, 'Planeswalker')))), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador ou planeswalker, compre uma carta.' }),
      activated('Discard a card', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Descarte uma carta: Coloque um marcador +1/+1 nesta criatura.' }),
      activated([{ k: 'exileFromGraveyard', n: 3 }], function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'addKeyword', kw: 'flying' }]);
      }, { text: 'Exile três cartas do seu cemitério: Esta criatura ganha voar até o fim do turno.' }),
    ],
  }],
  rulings: {},
});