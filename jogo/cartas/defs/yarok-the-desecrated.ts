// Yarok, the Desecrated
// Deathtouch, lifelink
// If a permanent entering causes a triggered ability of a permanent you control to trigger, that ability triggers an
// additional time.
import { controllerOf, defineCard, keyword, staticAbility } from '../../motor/api.ts';
import type { GameEvent } from '../../motor/events.ts';

const entrada = (e: GameEvent | null | undefined) => !!e && e.type === 'zone' && e.to === 'battlefield';

export default defineCard({
  name: 'Yarok, the Desecrated',
  faces: [{
    abilities: [
      keyword('deathtouch'), keyword('lifelink'),
      staticAbility({
        rules: {
          extraTriggers: (c, tr) => {
            if (tr.controller !== c.you || c.g.state.objects[tr.source]?.zone !== 'battlefield' || controllerOf(c.g, tr.source) !== c.you) return 0;
            return entrada(tr.cause) || (tr.batch ?? []).some(entrada) ? 1 : 0;
          },
        },
        text: 'Se um permanente entrando fizer disparar uma habilidade desencadeada de um permanente que você controla, essa habilidade dispara uma vez a mais.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.2 — vale para queda de terreno e para "quando isto entra"',
    2: 'regra geral: CR 603.2 — cada Yarok soma um disparo',
    3: 'regra geral: CR 603.2 — não vale para habilidades de cartas fora do campo',
  },
});
