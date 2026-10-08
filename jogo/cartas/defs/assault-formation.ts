// Assault Formation
// Each creature you control assigns combat damage equal to its toughness rather than its power.
// {G}: Target creature with defender can attack this turn as though it didn't have defender.
// {2}{G}: Creatures you control get +0/+1 until end of turn.
import { activated, and, controllerOf, creaturesOf, defineAbility, defineCard, is, ruleEffect, staticAbility, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const ATACA_COM_DEFENSOR = defineAbility('Assault Formation:defensorAtaca', staticAbility({
  rules: { canAttackWithDefender: (c, criatura) => !!((c as unknown as { effect?: { affected?: ObjId[] } }).effect?.affected?.includes(criatura)) },
}));

export default defineCard({
  name: 'Assault Formation',
  faces: [{
    abilities: [
      // CR 510.1c; ruling 2: muda só o dano atribuído, não a força
      staticAbility({ rules: { assignsByToughness: (c, criatura) => controllerOf(c.g, criatura) === c.you }, text: 'Cada criatura que você controla atribui dano de combate igual à resistência em vez da força.' }),
      activated('{G}', function* (c) {
        const id = tgt(c);
        if (id !== null) ruleEffect(c, ATACA_COM_DEFENSOR.id!, { kind: 'endOfTurn' }, { objs: [id] });
      }, { targets: [t.creature(and(is.creature, is.kw('defender')), 'criatura alvo com defensor')], text: '{G}: A criatura alvo com defensor pode atacar neste turno como se não tivesse defensor.' }),
      activated('{2}{G}', function* (c) { untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'pt', p: 0, t: 1 }]); }, { text: '{2}{G}: As criaturas que você controla recebem +0/+1 até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: uma criatura 0/4 atribui 4',
    2: 'teste: a força continua a mesma',
  },
});
