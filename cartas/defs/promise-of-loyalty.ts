// Promise of Loyalty
// Each player puts a vow counter on a creature they control and sacrifices the rest. Each of those creatures can't attack
// you or planeswalkers you control for as long as it has a vow counter on it.
import { addCounters, chooseItems, controllerOf, creaturesOf, defineAbility, defineCard, nameOf, objItem, ruleEffect, sacrifice, staticAbility } from '../../motor/api.ts';
import type { ContinuousEffect, ObjId } from '../../motor/types.ts';

// rulings 1-2: vale para aquela criatura enquanto tiver o marcador de voto; ruling 3: mesmo trocando de controle
const VOTO = defineAbility('Promise of Loyalty:voto', staticAbility({
  rules: {
    canAttack: (c, atacante, alvo) => {
      const e = (c as { effect?: ContinuousEffect }).effect;
      if (!e?.affected?.includes(atacante) || (c.g.state.objects[atacante]?.counters.vow ?? 0) <= 0) return true;
      const contraVoce = alvo.kind === 'player' ? alvo.id === c.you : controllerOf(c.g, alvo.id) === c.you;
      return !contraVoce;
    },
  },
  text: 'Esta criatura não pode atacar o conjurador de Promise of Loyalty nem os planeswalkers dele enquanto tiver um marcador de voto.',
}));

export default defineCard({
  name: 'Promise of Loyalty',
  faces: [{
    spell: {
      *effect(c) {
        // CR 101.4: escolhas em ordem APNAP; ruling 3: obrigatório se puder
        const escolhidas: ObjId[] = [];
        for (const p of c.g.apnap()) {
          const minhas = creaturesOf(c.g, p);
          if (!minhas.length) continue;
          const [id] = minhas.length === 1 ? [String(minhas[0])] : yield* chooseItems(c.g, p, 'Promise of Loyalty: escolha a criatura que recebe o marcador de voto', minhas.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
          escolhidas.push(Number(id));
        }
        for (const id of escolhidas) addCounters(c.g, { kind: 'obj', id }, 'vow', 1, c.you);
        const resto = c.g.apnap().flatMap((p) => creaturesOf(c.g, p)).filter((id) => !escolhidas.includes(id));
        if (resto.length) yield* sacrifice(c.g, resto);
        ruleEffect(c, VOTO.id!, { kind: 'permanent' }, { objs: escolhidas });
      },
    },
  }],
  rulings: {
    1: 'teste: sem o marcador de voto, pode atacar',
    2: 'regra geral: o efeito vale só para as criaturas escolhidas',
    3: 'teste: cada jogador, inclusive você, fica com uma criatura',
  },
});
