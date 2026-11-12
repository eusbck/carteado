// Witch's Oven
// {T}, Sacrifice a creature: Create a Food token. If the sacrificed creature's toughness was 4 or greater, create two
// Food tokens instead. (They're artifacts with "{2}, {T}, Sacrifice this token: You gain 3 life.")
import { activated, createTokens, defineCard, lkiChars } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { COMIDA } from '../tartarugas.ts';

export default defineCard({
  name: "Witch's Oven",
  faces: [{
    abilities: [
      activated('{T}, Sacrifice a creature', function* (c) {
        // a resistência é a da última informação conhecida da criatura sacrificada
        const [sac] = ((c.data.costInfo as { sacrificed?: ObjId[] } | undefined)?.sacrificed ?? []);
        const ch = sac !== undefined ? lkiChars(c.g, sac) : null;
        yield* createTokens(c.g, c.you, 'Food', (ch?.toughness ?? 0) >= 4 ? 2 : 1);
      }, { text: '{T}, Sacrifique uma criatura: Crie uma ficha Food. Se a resistência da criatura sacrificada era 4 ou mais, em vez disso crie duas fichas Food.' }),
    ],
  }],
  rulings: {
    1: COMIDA.tipo,
    2: COMIDA.qualquer,
    3: COMIDA.naoComa,
    4: 'regra geral: CR 602.2 — o sacrifício é custo, pago na ativação, sem prioridade no meio (motor/costs.ts payParts)',
  },
});
