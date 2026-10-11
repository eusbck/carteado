// Vibranium Strike Gauntlets
// Flash
// When this Equipment enters, attach it to target creature you control.
// Equipped creature gets +3/+0 and has trample and "Whenever this creature deals combat damage to a player, draw a
// card."
// Equip {3}
import { attach, attachedGets, defineAbility, defineCard, draw, equip, etb, is, keyword, on, t, tgt, triggered } from '../../motor/api.ts';

const COMPRA = defineAbility('Vibranium Strike Gauntlets:compra', triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
  yield* draw(c.g, c.you, 1);
}, { text: 'Sempre que esta criatura causa dano de combate a um jogador, compre uma carta.' }));

export default defineCard({
  name: 'Vibranium Strike Gauntlets',
  faces: [{
    abilities: [
      keyword('flash'),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null && c.g.state.objects[c.source]?.zone === 'battlefield') attach(c.g, c.source, id);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: 'Quando este Equipamento entra, anexe-o à criatura alvo que você controla.' }),
      attachedGets(() => [{ k: 'pt', p: 3, t: 0 }, { k: 'addKeyword', kw: 'trample' }, { k: 'addAbility', id: COMPRA.id! }], 'A criatura equipada recebe +3/+0 e tem atropelar e "Sempre que esta criatura causa dano de combate a um jogador, compre uma carta."'),
      equip('{3}'),
    ],
  }],
  rulings: {},
});