// Professor Hojo
// The first activated ability you activate during your turn that targets a creature you control costs {2} less to
// activate.
// Whenever one or more creatures you control become the target of an activated ability, draw a card. This ability
// triggers only once each turn.
import { controllerOf, defineCard, draw, isCreature, on, staticAbility, triggered } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import type { TargetRef } from '../../motor/types.ts';

const criaturaSua = (c: SCtx, t: TargetRef) => t.kind === 'obj' && c.g.state.objects[t.id]?.zone === 'battlefield' && isCreature(c.g, t.id) && controllerOf(c.g, t.id) === c.you;

export default defineCard({
  name: 'Professor Hojo',
  faces: [{
    abilities: [
      // ruling 1: vale para qualquer habilidade ativada (inclusive equipar); ruling 3: só a mana genérica (CR 601.2f)
      staticAbility({
        rules: {
          abilityCostModifier: (c, jogador, _fonte, def, alvos) => {
            if (jogador !== c.you || c.g.state.turn.active !== c.you) return null;
            // motor/stack.ts registra cada ativação do turno e se ela tinha como alvo uma criatura de quem ativou
            if ((c.g.state.turnStats[c.you]?.activationLog ?? []).some((a) => a.ownCreatureTargeted)) return null;
            // sem os alvos (estimativa de "dá para ativar?"), basta a habilidade ter alvo
            const ok = alvos === undefined ? !!def.targets?.length : alvos.some((t) => criaturaSua(c, t));
            return ok ? { reduce: 2 } : null;
          },
        },
        text: 'A primeira habilidade ativada que você ativa durante o seu turno que tem como alvo uma criatura que você controla custa {2} a menos para ser ativada.',
      }),
      // ruling 2: dispara ao ativar e resolve antes da habilidade
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'target' && !e.spell && criaturaSua(c, e.target) && c.g.state.objects[e.by]?.stack?.kind === 'activated')), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { oncePerTurn: true, text: 'Sempre que uma ou mais criaturas que você controla se tornam alvo de uma habilidade ativada, compre uma carta. Esta habilidade só dispara uma vez a cada turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: equipar é habilidade ativada: a primeira do seu turno com alvo numa criatura sua custa {2} a menos',
    2: 'teste: a compra resolve antes da habilidade ativada, e só uma vez por turno',
    3: 'teste: só reduz a mana genérica: equipar {1} fica {0}, sem sobra para outra habilidade',
  },
});
