// Marisi, Breaker of the Coil
// Your opponents can't cast spells during combat.
// Whenever a creature you control deals combat damage to a player, goad each creature that player controls. (Until your
// next turn, those creatures attack each combat if able and attack a player other than you if able.)
import { controllerOf, creaturesOf, defineCard, goad, isCreature, on, staticAbility, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

const COMBATE = new Set(['beginCombat', 'declareAttackers', 'declareBlockers', 'combatDamage', 'endCombat']);

export default defineCard({
  name: 'Marisi, Breaker of the Coil',
  faces: [{
    abilities: [
      // rulings 6-7: a proibição passa por cima de permissões de conjurar; ativar habilidades continua liberado
      staticAbility({
        rules: { cantCastSpells: (c, p) => c.g.isOpponent(c.you, p) && COMBATE.has(c.g.state.turn.step) },
        text: 'Os seus oponentes não podem conjurar mágicas durante o combate.',
      }),
      // ruling 8: só as criaturas que o jogador controla na resolução; ruling 9: continuam goadadas se Marisi sair
      triggered(on.custom((e, c) => (e.type === 'damage' && e.combat && e.target.kind === 'player' && !!c.g.state.objects[e.source]
        && isCreature(c.g, e.source) && controllerOf(c.g, e.source) === c.you ? { jogador: e.target.id } : false)), function* (c) {
        for (const id of creaturesOf(c.g, c.event.jogador as PlayerId)) goad(c.g, id, c.you);
      }, { text: 'Sempre que uma criatura que você controla causa dano de combate a um jogador, goade cada criatura que esse jogador controla.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.15b, 508.1d — goadada por vários jogadores, cumpre o máximo de exigências (motor/combat.ts requiredTargets)',
    2: 'regra geral: CR 508.1d — a exigência só vale se a criatura puder atacar, e custos de ataque não são obrigatórios (motor/combat.ts maxObeyed)',
    3: 'regra geral: CR 701.15b — ataca um jogador que não a goadou se puder; se não puder, ataca outro alvo ou não ataca (motor/combat.ts requirements)',
    4: 'regra geral: CR 701.15b — goadada é uma designação, não uma habilidade da criatura (motor/actions.ts goad)',
    5: 'regra geral: CR 701.15a — continua goadada até o próximo turno de quem goadou, em combates adicionais e sob outro controlador (motor/actions.ts goad)',
    6: 'teste: os oponentes não podem conjurar mágicas durante o combate, mas podem ativar habilidades',
    7: 'teste: os oponentes não podem conjurar mágicas durante o combate, mas podem ativar habilidades',
    8: 'teste: com dano de combate de uma criatura sua, goada cada criatura que o jogador controla',
    9: 'regra geral: CR 701.15a — a designação fica na criatura, não depende de Marisi continuar no campo (motor/actions.ts goad)',
    10: 'regra geral: CR 701.15a — goadada até o próximo turno de quem goadou (motor/actions.ts goad guarda o jogador e o turno)',
  },
});
