// Bramblewood Paragon
// Each other Warrior creature you control enters with an additional +1/+1 counter on it.
// Each creature you control with a +1/+1 counter on it has trample.
import { and, anthem, defineCard, is, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Bramblewood Paragon',
  faces: [{
    abilities: [
      // CR 614.12: olha as características com que a criatura entraria; quem entra junto com o Paragon não ganha nada
      // (ruling 4); vale para a que entra sob o seu controle, venha de onde vier (ruling 2); cumulativo (ruling 3)
      staticAbility({
        rules: {
          enterModifier: (c, ev, vaiSer) => {
            if (ev.controller !== c.you || ev.obj === c.source || !vaiSer.types.includes('Creature') || !vaiSer.subtypes.includes('Warrior')) return;
            ev.counters['+1/+1'] = (ev.counters['+1/+1'] ?? 0) + 1;
          },
        },
        text: 'Cada outra criatura Guerreiro que você controla entra com um marcador +1/+1 adicional.',
      }),
      anthem(and(is.creature, is.yours, is.withCounter('+1/+1')), () => [{ k: 'addKeyword', kw: 'trample' }], 'Cada criatura que você controla com um marcador +1/+1 tem atropelar.'),
    ],
  }],
  rulings: {
    1: 'teste: o outro Guerreiro entra com um marcador +1/+1 e ganha atropelar; criatura sem marcador não',
    2: 'regra geral: CR 614.12 — vale para a criatura que entra sob o seu controle, de qualquer zona (motor/actions.ts putOntoBattlefield)',
    3: 'regra geral: CR 614.12 — cada Paragon acrescenta o seu marcador (motor/actions.ts putOntoBattlefield, um enterModifier por fonte)',
    4: 'regra geral: CR 614.12 — quem entra ao mesmo tempo que o Paragon não recebe o marcador (motor/actions.ts putOntoBattlefield)',
  },
});
