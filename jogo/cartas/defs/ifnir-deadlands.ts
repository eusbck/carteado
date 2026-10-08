// Ifnir Deadlands
// {T}: Add {C}.
// {T}, Pay 1 life: Add {B}.
// {2}{B}{B}, {T}, Sacrifice a Desert: Put two -1/-1 counters on target creature an opponent controls. Activate only as a
// sorcery.
import { activated, addCounters, defineCard, is, mana, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Ifnir Deadlands',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana('B', { cost: '{T}, Pay 1 life', text: '{T}, Pague 1 de vida: Adicione {B}.' }),
      activated('{2}{B}{B}, {T}, Sacrifice a Desert', function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '-1/-1', 2, c.you);
      }, { timing: 'sorcery', targets: [t.creature(is.opponents, 'criatura alvo que um oponente controla')], text: '{2}{B}{B}, {T}, Sacrifique um Desert: Coloque dois marcadores -1/-1 na criatura alvo que um oponente controla. Ative só como feitiço.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 205.3i — Desert não tem habilidade de mana intrínseca',
    2: 'teste: pode sacrificar a si mesma para pagar o custo',
  },
});
