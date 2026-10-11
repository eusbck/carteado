// Basalt Monolith
// This artifact doesn't untap during your untap step.
// {T}: Add {C}{C}{C}.
// {3}: Untap this artifact.
import { activated, controllerOf, defineCard, mana, staticAbility, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Basalt Monolith',
  faces: [{
    abilities: [
      // CR 502.3: só na sua etapa de desvirar
      staticAbility({ rules: { cantUntapDuringUntapOf: (c, obj, ativo) => obj === c.source && ativo === controllerOf(c.g, c.source) }, text: 'Este artefato não desvira durante a sua etapa de desvirar.' }),
      mana('CCC'),
      // ruling 1: pode desvirar quantas vezes você pagar
      activated('{3}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untap(c.g, c.source);
      }, { text: '{3}: Desvire este artefato.' }),
    ],
  }],
  rulings: {
    1: 'teste: {T}: {C}{C}{C}; {3}: desvira; não desvira na sua etapa de desvirar',
  },
});
