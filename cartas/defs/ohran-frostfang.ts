// Ohran Frostfang
// Attacking creatures you control have deathtouch.
// Whenever a creature you control deals combat damage to a player, draw a card.
import { anthem, defineCard, draw, isAttacking, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Ohran Frostfang',
  faces: [{
    abilities: [
      anthem((c, id) => c.g.state.objects[id]?.controller === c.you && isAttacking(c.g, id), () => [{ k: 'addKeyword', kw: 'deathtouch' }], 'As criaturas atacantes que você controla têm toque mortífero.'),
      triggered(on.custom((e, c) => e.type === 'damage' && e.combat && e.target.kind === 'player' && e.controller === c.you), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que uma criatura que você controla causa dano de combate a um jogador, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 205.4 — neve é só um supertipo',
    2: 'teste: CR 603.10a: morrendo no mesmo dano, ainda dispara para cada criatura',
  },
});
