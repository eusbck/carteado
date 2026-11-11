// Professor Hojo
// The first activated ability you activate during your turn that targets a creature you control costs {2} less to
// activate.
// Whenever one or more creatures you control become the target of an activated ability, draw a card. This ability
// triggers only once each turn.
import { controllerOf, defineCard, draw, isCreature, on, staticAbility, triggered } from '../../motor/api.ts';

const chave = (p: number) => `hojo:${p}`;

export default defineCard({
  name: 'Professor Hojo',
  faces: [{
    abilities: [
      // simplificação: a redução vale para a primeira habilidade do turno que PODE mirar uma criatura; os alvos ainda
      // não foram escolhidos quando o custo é calculado (ruling 3: só genérico)
      staticAbility({
        rules: {
          abilityCostModifier: (c, p, _f, def) => {
            if (p !== c.you || c.g.state.turn.active !== c.you || c.g.state.turnCounters[chave(p)]) return null;
            const pode = (def.targets ?? []).some((s) => s.what === 'object' || s.what === 'any');
            return pode ? { reduce: 2 } : null;
          },
        },
        text: 'A primeira habilidade ativada que você ativa durante o seu turno com uma criatura sua como alvo custa {2} a menos para ser ativada.',
      }),
      // anota (sem disparar) a primeira habilidade com alvo numa criatura sua; e compra uma vez por turno
      triggered(on.custom((e, c) => {
        if (e.type !== 'target' || e.spell || e.target.kind !== 'obj') return false;
        const id = e.target.id;
        if (!c.g.state.objects[id] || !isCreature(c.g, id) || controllerOf(c.g, id) !== c.you) return false;
        if (e.controller === c.you && c.g.state.turn.active === c.you) c.g.state.turnCounters[chave(c.you)] = 1;
        return true;
      }), function* (c) { yield* draw(c.g, c.you, 1); }, {
        oncePerTurn: true,
        text: 'Sempre que uma ou mais criaturas que você controla se tornam alvo de uma habilidade ativada, compre uma carta. Esta habilidade dispara apenas uma vez a cada turno.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 602.1 — habilidades com dois-pontos, inclusive equipar (motor/stack.ts)',
    2: 'regra geral: CR 603.3 — o gatilho resolve antes da habilidade, mesmo se ela sair da pilha (motor/stack.ts)',
    3: 'teste: equipar no seu turno sai {2} mais barato e compra uma carta',
  },
});
