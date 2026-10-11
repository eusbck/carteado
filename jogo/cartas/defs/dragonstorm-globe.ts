// Dragonstorm Globe
// Each Dragon you control enters with an additional +1/+1 counter on it.
// {T}: Add one mana of any color.
import { defineCard, mana, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Dragonstorm Globe',
  faces: [{
    abilities: [
      // CR 614.1c, 614.12: substituição sobre como o Dragon entra; olha as características com que ele entraria
      staticAbility({
        rules: {
          enterModifier: (c, ev, wouldBe) => {
            if (ev.controller !== c.you || ev.obj === c.source || !wouldBe.subtypes.includes('Dragon')) return;
            ev.counters['+1/+1'] = (ev.counters['+1/+1'] ?? 0) + 1;
          },
        },
        text: 'Cada Dragon que você controla entra com um marcador +1/+1 adicional.',
      }),
      mana('any'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 614.12 — só as estáticas que já estão no campo alteram quem entra; quem entra junto com o Globo não recebe o marcador (motor/actions.ts putOntoBattlefield)',
  },
});
