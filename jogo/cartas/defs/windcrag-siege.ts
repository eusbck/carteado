// Windcrag Siege
// As this enchantment enters, choose Mardu or Jeskai.
// • Mardu — If a creature attacking causes a triggered ability of a permanent you control to trigger, that ability
// triggers an additional time.
// • Jeskai — At the beginning of your upkeep, create a 1/1 red Goblin creature token. It gains lifelink and haste until
// end of turn.
import { asEnters, chooseOne, controllerOf, createTokens, defineCard, lkiObj, on, staticAbility, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

/** modo escolhido ao entrar (CR 614.12a, 607.2d); com a última informação se a Siege já saiu (CR 113.7a) */
function modo(c: SCtx): unknown {
  return lkiObj(c.g, c.source)?.choices.modo;
}

export default defineCard({
  name: 'Windcrag Siege',
  faces: [{
    abilities: [
      asEnters(function* (c, ev) {
        ev.choices.modo = yield* chooseOne(c.g, ev.controller, 'Windcrag Siege: escolha Mardu ou Jeskai', [
          { id: 'Mardu', label: 'Mardu — gatilhos causados por criaturas atacando disparam uma vez a mais' },
          { id: 'Jeskai', label: 'Jeskai — na sua manutenção, crie uma ficha de Goblin 1/1 com vínculo com a vida e ímpeto' },
        ]);
      }, 'Ao entrar, escolha Mardu ou Jeskai.'),
      // CR 603.2d: determina quantas vezes a habilidade dispara; vale para os gatilhos de declarar atacantes
      // (CR 508.1m, 508.3a) de qualquer permanente que você controla, inclusive "sempre que você ataca"
      staticAbility({
        condition: (c) => modo(c) === 'Mardu',
        rules: {
          extraTriggers: (c, t) => {
            const e = t.cause;
            if (!e || e.type !== 'attackers' || e.attackers.length === 0) return 0;
            if (t.controller !== c.you || c.g.state.objects[t.source]?.zone !== 'battlefield' || controllerOf(c.g, t.source) !== c.you) return 0;
            return 1;
          },
        },
        text: 'Mardu — Se uma criatura atacando fizer disparar uma habilidade de um permanente que você controla, ela dispara uma vez a mais.',
      }),
      triggered(on.upkeep('you'), function* (c) {
        const fichas = yield* createTokens(c.g, c.you, 'Goblin', 1);
        untilEndOfTurn(c, fichas, [{ k: 'addKeyword', kw: 'lifelink' }, { k: 'addKeyword', kw: 'haste' }]);
      }, {
        condition: (c) => modo(c) === 'Jeskai',
        text: 'Jeskai — No início da sua manutenção, crie uma ficha de criatura Goblin vermelha 1/1. Ela ganha vínculo com a vida e ímpeto até o fim do turno.',
      }),
    ],
  }],
  rulings: {},
});
