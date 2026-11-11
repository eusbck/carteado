// Forge Anew
// When this enchantment enters, return target Equipment card from your graveyard to the battlefield.
// During your turn, you may activate equip abilities any time you could cast an instant.
// You may pay {0} rather than pay the equip cost of the first equip ability you activate during each of your turns.
import { chars, defineCard, etb, putOntoBattlefield, staticAbility, t, tgt } from '../../motor/api.ts';
import { ehEquipar, primeiroEquiparGratis, registraEquipar } from '../armaria.ts';

export default defineCard({
  name: 'Forge Anew',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        targets: [t.card('graveyard', (c, id) => chars(c.g, id).subtypes.includes('Equipment'), 'carta de Equipamento alvo do seu cemitério', 'you')],
        text: 'Quando este encantamento entra, devolva a carta de Equipamento alvo do seu cemitério para o campo de batalha.',
      }),
      // CR 602.5d; ruling 1: reconfigurar não é equipar
      staticAbility({
        rules: { activateAsInstant: (c, p, _f, def) => p === c.you && c.g.state.turn.active === c.you && ehEquipar(def) },
        text: 'Durante o seu turno, você pode ativar habilidades de equipar a qualquer momento em que poderia conjurar uma instantânea.',
      }),
      registraEquipar(),
      primeiroEquiparGratis(true, 'Você pode pagar {0} em vez do custo de equipar da primeira habilidade de equipar que ativar durante cada um dos seus turnos.'),
    ],
  }],
  rulings: { 1: 'regra geral: CR 702.151 — reconfigurar não é habilidade de equipar (cartas/armaria.ts ehEquipar)' },
});
