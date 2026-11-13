// Kami of Whispered Hopes
// If one or more +1/+1 counters would be put on a permanent you control, that many plus one +1/+1 counters are put on
// that permanent instead.
// {T}: Add X mana of any one color, where X is this creature's power.
import { defineCard, mana, power, staticAbility } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Kami of Whispered Hopes',
  faces: [{
    abilities: [
      // CR 614.1a; ruling 2: também quem entra com marcadores; ruling 5: não vale para ela mesma ao entrar (ainda não
      // está no campo quando a substituição é aplicada)
      staticAbility({
        rules: { countersBonus: (c, tipo, perm) => (tipo === '+1/+1' && perm.controller === c.you ? 1 : 0) },
        text: 'Se um ou mais marcadores +1/+1 fossem ser colocados num permanente que você controla, em vez disso são colocados nele esses marcadores mais um.',
      }),
      mana((c) => {
        const x = Math.max(0, power(c.g, c.source));
        return x > 0 ? (['W', 'U', 'B', 'R', 'G'] as ManaType[]).map((cor) => Array<ManaType>(x).fill(cor)) : [];
      }, { text: '{T}: Adicione X manas de uma mesma cor qualquer, onde X é a força desta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: com duas Kami, dois marcadores a mais',
    2: 'regra geral: CR 614.1c — entrar com marcadores também é substituído (motor/actions.ts countersAfterReplacements)',
    3: 'regra geral: CR 616.1 — com várias substituições, o motor soma antes de dobrar (motor/actions.ts countersAfterReplacements)',
    4: 'teste: X manas de uma cor só, onde X é a força',
    5: 'regra geral: CR 614.12 — a substituição de quem está entrando não se aplica a ele mesmo (motor/actions.ts putOntoBattlefield)',
  },
});
