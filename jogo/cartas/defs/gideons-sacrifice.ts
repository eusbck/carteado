// Gideon's Sacrifice
// Choose a creature or planeswalker you control. All damage that would be dealt this turn to you and permanents you
// control is dealt to the chosen permanent instead (if it's still on the battlefield).
import { chooseItems, controlledBy, defineCard, isType, nameOf, objItem, ruleEffect } from '../../motor/api.ts';

export default defineCard({
  name: "Gideon's Sacrifice",
  faces: [{
    spell: {
      *effect(c) {
        // a escolha é na resolução, sem alvo; sem criatura nem planeswalker, nada acontece (ruling 2)
        const cands = controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Creature') || isType(c.g, id, 'Planeswalker'));
        if (!cands.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, "Gideon's Sacrifice: escolha uma criatura ou planeswalker que você controla", cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
        // CR 614.9: redirecionamento até o fim do turno (motor/actions.ts redirectedDamage, com `permanents`)
        ruleEffect(c, 'rule:redirectDamageTo', { kind: 'endOfTurn' }, { params: { controller: c.you, to: Number(esc), permanents: true } });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 614.9 — o redirecionamento só vale para o dano causado depois da resolução',
    2: 'teste: sem criatura nem planeswalker, nada acontece',
    3: 'regra geral: a escolhida que saiu do campo ou deixou de ser criatura ou planeswalker não recebe o dano (motor/actions.ts redirectedDamage)',
    4: 'teste: o dano a você e às suas permanentes vai todo para a escolhida, mesmo além da resistência',
    5: 'teste: o dano a você e às suas permanentes vai todo para a escolhida, mesmo além da resistência',
    6: 'não se aplica: o deck tem um Gideon\'s Sacrifice só; com dois, o motor usa o primeiro efeito, sem perguntar',
  },
});
