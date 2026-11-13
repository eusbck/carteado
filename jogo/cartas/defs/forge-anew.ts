// Forge Anew
// When this enchantment enters, return target Equipment card from your graveyard to the battlefield.
// During your turn, you may activate equip abilities any time you could cast an instant.
// You may pay {0} rather than pay the equip cost of the first equip ability you activate during each of your turns.
import { defineCard, etb, isSubtype, putOntoBattlefield, staticAbility, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Forge Anew',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        targets: [t.card('graveyard', (c, id) => isSubtype(c.g, id, 'Equipment'), 'carta de Equipamento alvo do seu cemitério', 'you')],
        text: 'Quando este encantamento entra, devolva a carta de Equipamento alvo do seu cemitério ao campo.',
      }),
      // ruling 1: só habilidades de equipar (inclusive as variantes com restrição); reconfigurar não é equipar
      staticAbility({
        rules: { equipAsInstant: (c, jogador) => jogador === c.you && c.g.state.turn.active === c.you },
        text: 'Durante o seu turno, você pode ativar habilidades de equipar a qualquer momento em que poderia conjurar uma mágica instantânea.',
      }),
      staticAbility({
        rules: { equipForZero: (c, jogador) => jogador === c.you && c.g.state.turn.active === c.you },
        text: 'Você pode pagar {0} em vez do custo de equipar da primeira habilidade de equipar que você ativar durante cada um dos seus turnos.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: vale para variantes de equipar ("Equipar criatura lendária"), mas não para reconfigurar',
  },
});
