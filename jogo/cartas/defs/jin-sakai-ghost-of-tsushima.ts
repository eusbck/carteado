// Jin Sakai, Ghost of Tsushima
// Whenever Jin Sakai deals combat damage to a player, draw a card.
// Whenever a creature you control attacks a player, if no other creatures are attacking that player, choose one —
// • Standoff — It gains double strike until end of turn.
// • Ghost — It can't be blocked this turn.
import { controllerOf, defineCard, draw, modal, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Jin Sakai, Ghost of Tsushima',
  faces: [{
    abilities: [
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Sempre que Jin Sakai causa dano de combate a um jogador, compre uma carta.' }),
      // um gatilho para cada criatura sua que ataca sozinha um jogador
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers') return false;
        return e.attackers.filter((a) => a.target.kind === 'player' && !!c.g.state.objects[a.obj] && controllerOf(c.g, a.obj) === c.you
          && !e.attackers.some((b) => b.obj !== a.obj && b.target.kind === 'player' && b.target.id === a.target.id)).map((a) => ({ criatura: a.obj }));
      }), function* () { /* modos */ }, {
        modes: modal(1, 1, [
          { text: 'Standoff — Ela ganha golpe duplo até o fim do turno', *effect(c) { const id = c.event.criatura as number; if (c.g.state.objects[id]?.zone === 'battlefield') untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'double strike' }]); } },
          { text: 'Ghost — Ela não pode ser bloqueada neste turno', *effect(c) { const id = c.event.criatura as number; if (c.g.state.objects[id]?.zone === 'battlefield') untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:cantBeBlocked' }]); } },
        ]),
        text: 'Sempre que uma criatura que você controla ataca um jogador, se nenhuma outra criatura estiver atacando esse jogador, escolha um — Standoff: ela ganha golpe duplo até o fim do turno; ou Ghost: ela não pode ser bloqueada neste turno.',
      }),
    ],
  }],
  rulings: {},
});