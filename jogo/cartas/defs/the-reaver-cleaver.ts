// The Reaver Cleaver
// Equipped creature gets +1/+1 and has trample and "Whenever this creature deals combat damage to a player or
// planeswalker, create that many Treasure tokens."
// Equip {3}
import { attachedGets, createTokens, defineAbility, defineCard, equip, isType, lkiChars, on, triggered } from '../../motor/api.ts';

const TESOUROS = defineAbility('The Reaver Cleaver:tesouros', triggered(on.custom((e, c) => {
  if (e.type !== 'damage' || !e.combat || e.source !== c.source) return false;
  const ok = e.target.kind === 'player'
    || (c.g.state.objects[e.target.id] ? isType(c.g, e.target.id, 'Planeswalker') : !!lkiChars(c.g, e.target.id)?.types.includes('Planeswalker'));
  return ok ? { dano: e.amount } : false;
}), function* (c) {
  const n = Number(c.event.dano ?? 0);
  if (n > 0) yield* createTokens(c.g, c.you, 'Treasure', n);
}, { text: 'Sempre que esta criatura causa dano de combate a um jogador ou planeswalker, crie essa quantidade de fichas de Tesouro.' }));

export default defineCard({
  name: 'The Reaver Cleaver',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'trample' }, { k: 'addAbility', id: TESOUROS.id! }],
        'A criatura equipada recebe +1/+1 e tem atropelar e "Sempre que esta criatura causa dano de combate a um jogador ou planeswalker, crie essa quantidade de fichas de Tesouro."'),
      equip('{3}'),
    ],
  }],
  rulings: {},
});
