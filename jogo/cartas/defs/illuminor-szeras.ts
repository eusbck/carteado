// Illuminor Szeras
// Secrets of the Soul — {T}, Sacrifice another creature: Add an amount of {B} equal to the sacrificed creature's mana
// value.
import { activated, addMana, defineCard, lkiChars, manaValueOf } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Illuminor Szeras',
  faces: [{
    abilities: [
      // Simplificação: é tratada como habilidade ativada comum (usa a pilha), porque a quantidade de mana depende da
      // criatura sacrificada no custo. Ruling 1: o valor de mana de quando ela esteve no campo pela última vez.
      activated('{T}, Sacrifice another creature', function* (c) {
        const sac = ((c.data.costInfo as { sacrificed?: ObjId[] } | undefined)?.sacrificed ?? [])[0];
        const ch = sac !== undefined ? lkiChars(c.g, sac) : null;
        const n = ch ? manaValueOf(ch.manaCost, 0) : 0;
        if (n > 0) addMana(c.g, c.you, Array(n).fill('B'), { source: c.source });
      }, { text: 'Secrets of the Soul — {T}, Sacrifique outra criatura: Adicione uma quantidade de {B} igual ao valor de mana da criatura sacrificada.' }),
    ],
  }],
  rulings: { 1: 'teste: {T}, sacrifique outra criatura: adiciona {B} igual ao valor de mana que ela tinha no campo' },
});