// Ozolith, the Shattered Spire
// If one or more +1/+1 counters would be put on an artifact or creature you control, that many plus one +1/+1 counters
// are put on it instead.
// {1}{G}, {T}: Put a +1/+1 counter on target artifact or creature you control. Activate only as a sorcery.
// Cycling {2} ({2}, Discard this card: Draw a card.)
import { activated, addCounters, and, cycling, defineCard, is, or, staticAbility, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Ozolith, the Shattered Spire',
  faces: [{
    abilities: [
      // CR 614.1a; ruling 2: também quem entra com marcadores; ruling 1: não vale para ele mesmo ao entrar
      staticAbility({
        rules: { countersBonus: (c, tipo, perm) => (tipo === '+1/+1' && perm.controller === c.you && (perm.chars.types.includes('Artifact') || perm.chars.types.includes('Creature')) ? 1 : 0) },
        text: 'Se um ou mais marcadores +1/+1 fossem ser colocados num artefato ou criatura que você controla, em vez disso são colocados nele esses marcadores mais um.',
      }),
      activated('{1}{G}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, {
        timing: 'sorcery',
        targets: [t.permanent(and(is.yours, or(is.artifact, is.creature)), 'artefato ou criatura alvo que você controla')],
        text: '{1}{G}, {T}: Coloque um marcador +1/+1 no artefato ou criatura alvo que você controla. Ative somente como feitiço.',
      }),
      cycling('{2}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 614.12 — a substituição de quem está entrando não se aplica a ele mesmo (motor/actions.ts putOntoBattlefield)',
    2: 'regra geral: CR 614.1c — entrar com marcadores também é substituído (motor/actions.ts countersAfterReplacements)',
    3: 'regra geral: CR 616.1 — com várias substituições, o motor soma antes de dobrar (motor/actions.ts countersAfterReplacements)',
    4: 'regra geral: CR 614.1a — cada Ozolith soma mais um (um countersBonus por fonte, motor/actions.ts)',
  },
});
