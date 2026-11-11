// Professor Hojo
// The first activated ability you activate during your turn that targets a creature you control costs {2} less to
// activate.
// Whenever one or more creatures you control become the target of an activated ability, draw a card. This ability
// triggers only once each turn.
import { controllerOf, creaturesOf, defineCard, draw, isCreature, miraCriaturaPropria, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Professor Hojo',
  faces: [{
    abilities: [
      // ruling 3: só o genérico (CR 601.2f); as ativações com criatura sua como alvo ficam contadas no turno
      // (turnStats.activatedTargetingOwnCreature, motor/equipar.ts). Antes de escolher os alvos (ao ver se dá para
      // ativar), supõe que a habilidade com alvos vai mirar uma criatura sua.
      staticAbility({
        rules: {
          abilityCostModifier: (c, jogador, _fonte, def, alvos) => {
            const s = c.g.state;
            if (jogador !== c.you || s.turn.active !== c.you) return null;
            if ((s.turnStats[c.you]?.activatedTargetingOwnCreature ?? 0) > 0) return null;
            const mira = alvos ? miraCriaturaPropria(c.g, c.you, alvos) : (def.targets?.length ?? 0) > 0 && creaturesOf(c.g, c.you).length > 0;
            return mira ? { reduce: 2 } : null;
          },
        },
        text: 'A primeira habilidade ativada que você ativar durante o seu turno com uma criatura que você controla como alvo custa {2} a menos para ser ativada.',
      }),
      // ruling 2: resolve antes da habilidade que o disparou, mesmo se ela for anulada
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'target' && !e.spell && e.target.kind === 'obj'
        && c.g.state.objects[e.by]?.stack?.kind === 'activated' && !!c.g.state.objects[e.target.id]
        && isCreature(c.g, e.target.id) && controllerOf(c.g, e.target.id) === c.you)), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { oncePerTurn: true, text: 'Sempre que uma ou mais criaturas que você controla se tornam alvo de uma habilidade ativada, compre uma carta. Esta habilidade dispara somente uma vez a cada turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: equipar é habilidade ativada: custa {2} a menos e dispara a compra',
    2: 'teste: a compra resolve antes da habilidade que a disparou',
    3: 'teste: só reduz o genérico; a segunda ativação do turno paga o custo inteiro',
  },
});
