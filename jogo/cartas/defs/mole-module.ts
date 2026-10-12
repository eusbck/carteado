// Mole Module
// Menace
// Whenever this Vehicle deals combat damage to a player, mill four cards. You may put a permanent card from among them
// onto the battlefield.
// Crew 2
import { chooseItems, crew, defineCard, isPermanentCard, keyword, mill, nameOf, objItem, on, putOntoBattlefield, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Mole Module',
  faces: [{
    abilities: [
      keyword('menace'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const trituradas = (yield* mill(c.g, c.you, 4)).filter((id) => c.g.state.objects[id]?.zone === 'graveyard' && isPermanentCard(c.g, id));
        if (!trituradas.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Mole Module: você pode pôr no campo uma carta de permanente entre as trituradas', trituradas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc.length) yield* putOntoBattlefield(c.g, [{ id: Number(esc[0]), controller: c.you }], 'effect');
      }, { text: 'Sempre que este Veículo causa dano de combate a um jogador, triture quatro cartas. Você pode pôr no campo uma carta de permanente entre elas.' }),
      crew(2),
    ],
  }],
  rulings: {},
});