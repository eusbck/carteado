// Taunt from the Rampart
// Goad all creatures your opponents control. Until your next turn, those creatures can't block. (Until your next turn,
// those creatures attack each combat if able and attack a player other than you if able.)
import { addEffect, allCreatures, controllerOf, defineCard, goad } from '../../motor/api.ts';

export default defineCard({
  name: 'Taunt from the Rampart',
  faces: [{
    spell: {
      *effect(c) {
        // só as criaturas que os oponentes controlam na resolução
        const ids = allCreatures(c.g).filter((id) => c.g.isOpponent(c.you, controllerOf(c.g, id)));
        if (!ids.length) return;
        for (const id of ids) goad(c.g, id, c.you);
        addEffect(c.g, {
          source: c.source, sourceDef: '', controller: c.you, affected: ids,
          duration: { kind: 'untilYourNextTurn', player: c.you, sinceTurn: c.g.state.turn.number },
          mods: [{ k: 'rule', id: 'rule:cantBlock' }],
        });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 508.1d — a exigência só vale se a criatura puder atacar, e custos de ataque não são obrigatórios (motor/combat.ts maxObeyed)',
    2: 'regra geral: CR 701.15b — ataca um jogador que não a goadou se puder; se não puder, ataca outro alvo ou não ataca (motor/combat.ts requirements)',
    3: 'regra geral: CR 701.15b — goadada é uma designação, não uma habilidade da criatura (motor/actions.ts goad)',
    4: 'regra geral: CR 701.15a — continua goadada até o próximo turno de quem goadou, em combates adicionais e sob outro controlador (motor/actions.ts goad)',
    5: 'regra geral: CR 701.15b, 508.1d — goadada por vários jogadores, cumpre o máximo de exigências (motor/combat.ts requiredTargets)',
  },
});
