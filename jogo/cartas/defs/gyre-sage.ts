// Gyre Sage
// Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature,
// put a +1/+1 counter on this creature.)
// {T}: Add {G} for each +1/+1 counter on this creature.
import { defineCard, evolve, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

const EVOLUIR = 'regra geral: CR 702.100a — evoluir compara força com força e resistência com resistência, ao disparar e ao resolver (motor/criaturas.ts evolve)';

export default defineCard({
  name: 'Gyre Sage',
  faces: [{
    abilities: [
      evolve(),
      mana((c) => {
        const n = c.g.state.objects[c.source]?.counters['+1/+1'] ?? 0;
        return n > 0 ? [Array<ManaType>(n).fill('G')] : [];
      }, { text: '{T}: Adicione {G} para cada marcador +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {
    1: EVOLUIR,
    2: EVOLUIR,
    3: EVOLUIR,
    4: EVOLUIR,
    5: 'regra geral: CR 702.100a — os marcadores com que a criatura entra contam na comparação (motor/criaturas.ts evolve)',
    6: EVOLUIR,
    7: 'teste: evolui com uma criatura maior e gera {G} por marcador',
  },
});
