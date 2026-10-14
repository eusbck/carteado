// Orzhov Advokist
// At the beginning of your upkeep, each player may put two +1/+1 counters on a creature they control. If a player does,
// creatures that player controls can't attack you or planeswalkers you control until your next turn.
import {
  addCounters, chooseItems, controlledBy, controllerOf, defineAbility, defineCard, isCreature, isType, nameOf, objItem, on,
  ruleEffect, triggered,
} from '../../motor/api.ts';
import type { SCtx, StaticDef } from '../../motor/defs.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

// "as criaturas desse jogador não podem atacar você nem os planeswalkers que você controla" (CR 508.1c)
const NAO_ATACA = defineAbility<StaticDef>('Orzhov Advokist:naoAtaca', {
  kind: 'static',
  rules: {
    canAttack: (c, atacante, alvo) => {
      const prm = (c as SCtx & { params?: { jogador: PlayerId; protegido: PlayerId } }).params;
      if (!prm || controllerOf(c.g, atacante) !== prm.jogador) return true;
      if (alvo.kind === 'player') return alvo.id !== prm.protegido;
      return !(c.g.state.objects[alvo.id] && isType(c.g, alvo.id, 'Planeswalker') && controllerOf(c.g, alvo.id) === prm.protegido);
    },
  },
});

export default defineCard({
  name: 'Orzhov Advokist',
  faces: [{
    abilities: [
      triggered(on.upkeep('you'), function* (c) {
        // ruling 1: em ordem de turno, cada um escolhe (ou não) sabendo o que os anteriores escolheram; os marcadores
        // entram todos juntos depois (ruling 2: não é alvo)
        const escolhas: { p: PlayerId; id: ObjId }[] = [];
        for (const p of c.g.apnap()) {
          const minhas = controlledBy(c.g, p, (id) => isCreature(c.g, id));
          if (!minhas.length) continue;
          const nao = { id: 'nao', label: 'Não colocar marcadores' };
          const [esc] = yield* chooseItems(c.g, p, 'Orzhov Advokist: colocar dois marcadores +1/+1 numa criatura sua? (se colocar, suas criaturas não podem atacar o dono da carta nem os planeswalkers dele até o próximo turno dele)',
            [nao, ...minhas.map((id) => objItem(c.g, id, nameOf(c.g, id)))], 1, 1);
          if (esc !== 'nao') escolhas.push({ p, id: Number(esc) });
        }
        for (const { p, id } of escolhas) {
          addCounters(c.g, { kind: 'obj', id }, '+1/+1', 2, p);
          // ruling 3-4: vale para todas as criaturas do jogador, até o próximo turno de quem controla o Advokist
          ruleEffect(c, NAO_ATACA.id!, { kind: 'untilYourNextTurn', player: c.you, sinceTurn: c.g.state.turn.number }, { params: { jogador: p, protegido: c.you } });
        }
      }, { text: 'No início da sua manutenção, cada jogador pode colocar dois marcadores +1/+1 numa criatura que controla. Se um jogador fizer isso, as criaturas que ele controla não podem atacar você nem os planeswalkers que você controla até o seu próximo turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: na sua manutenção, Bruno aceita: a criatura dele recebe dois marcadores e ele não pode atacar você até o seu próximo turno',
    2: 'regra geral: a criatura é escolhida na resolução (chooseItems), sem alvo; os marcadores entram juntos depois das escolhas',
    3: 'teste: na sua manutenção, Bruno aceita: a criatura dele recebe dois marcadores e ele não pode atacar você até o seu próximo turno',
    4: 'teste: a restrição continua mesmo sem o Advokist no campo',
  },
});
