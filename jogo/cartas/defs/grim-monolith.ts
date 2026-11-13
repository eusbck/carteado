// Grim Monolith
// This artifact doesn't untap during your untap step.
// {T}: Add {C}{C}{C}.
// {4}: Untap this artifact.
import { activated, controllerOf, defineCard, mana, staticAbility, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Grim Monolith',
  faces: [{
    abilities: [
      // CR 502.3: só na sua etapa de desvirar
      staticAbility({ rules: { cantUntapDuringUntapOf: (c, obj, ativo) => obj === c.source && ativo === controllerOf(c.g, c.source) }, text: 'Este artefato não desvira durante a sua etapa de desvirar.' }),
      mana('CCC'),
      activated('{4}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untap(c.g, c.source);
      }, { text: '{4}: Desvire este artefato.' }),
    ],
  }],
  rulings: {},
});
