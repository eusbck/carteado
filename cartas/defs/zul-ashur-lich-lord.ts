// Zul Ashur, Lich Lord
// Ward—Pay 2 life. (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it
// unless that player pays 2 life.)
// {T}: You may cast target Zombie creature card from your graveyard this turn.
import { activated, and, defineAbility, defineCard, is, ruleEffect, staticAbility, t, tgt, ward } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// permissão até o fim do turno para a carta escolhida, enquanto ela continuar no seu cemitério (CR 400.7: se sair e
// voltar, é outro objeto). Ruling 1: paga todos os custos e segue o tempo normal.
const PODE = defineAbility('Zul Ashur, Lich Lord:conjurar', staticAbility({
  rules: {
    mayPlayFrom: (c, p, carta) => {
      const e = (c as unknown as { effect?: { affected?: ObjId[] } }).effect;
      const o = c.g.state.objects[carta];
      if (p !== c.you || !e?.affected?.includes(carta) || !o || o.zone !== 'graveyard' || o.owner !== c.you) return null;
      return { key: `zul-ashur:${carta}`, label: 'Zul Ashur (do cemitério)' };
    },
  },
  text: 'Você pode conjurar a carta de criatura Zumbi escolhida do seu cemitério neste turno.',
}));

export default defineCard({
  name: 'Zul Ashur, Lich Lord',
  faces: [{
    abilities: [
      ...ward('Pay 2 life'),
      activated('{T}', function* (c) {
        const id = tgt(c);
        if (id !== null) ruleEffect(c, PODE.id!, { kind: 'endOfTurn' }, { objs: [id] });
      }, {
        targets: [t.card('graveyard', and(is.creature, is.subtype('Zombie')), 'carta de criatura Zumbi do seu cemitério', 'you')],
        text: '{T}: Você pode conjurar a carta de criatura Zumbi alvo do seu cemitério neste turno.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: paga o custo de mana normal e segue o tempo de feitiço da criatura',
  },
});
