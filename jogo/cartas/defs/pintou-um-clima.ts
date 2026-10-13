// Pintou um Clima (carta própria da mesa)
// Flash
// Enchant creature
// Enchanted creature can't block.
// At the beginning of the upkeep of enchanted creature's controller, that player loses 1 life and you gain 1 life.
import { controllerOf, defineCard, gainLife, keyword, loseLife, on, staticAbility, t, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Pintou um Clima',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      keyword('flash'),
      staticAbility({
        rules: { canBlock: (c, bloqueador) => c.g.state.objects[c.source]?.attachedTo !== bloqueador },
        text: 'A criatura encantada não pode bloquear.',
      }),
      triggered(on.upkeep('each'), function* (c) {
        const criatura = c.g.state.objects[c.source]?.attachedTo;
        if (criatura === null || criatura === undefined) return;
        const p = controllerOf(c.g, criatura);
        loseLife(c.g, p, 1, c.source);
        gainLife(c.g, c.you, 1, c.source);
      }, {
        // só na manutenção de quem controla a criatura encantada
        condition: (c) => {
          const criatura = c.g.state.objects[c.source]?.attachedTo;
          return criatura !== null && criatura !== undefined && controllerOf(c.g, criatura) === c.g.state.turn.active;
        },
        text: 'No início da manutenção do controlador da criatura encantada, aquele jogador perde 1 ponto de vida e você ganha 1 ponto de vida.',
      }),
    ],
  }],
  rulings: {},
});
