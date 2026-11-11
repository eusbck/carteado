// Mana Vault
// This artifact doesn't untap during your untap step.
// At the beginning of your upkeep, you may pay {4}. If you do, untap this artifact.
// At the beginning of your draw step, if this artifact is tapped, it deals 1 damage to you.
// {T}: Add {C}{C}{C}.
import { controllerOf, dealDamage, defineCard, mana, mayPay, on, staticAbility, triggered, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Mana Vault',
  faces: [{
    abilities: [
      // CR 502.3: só na sua etapa de desvirar
      staticAbility({ rules: { cantUntapDuringUntapOf: (c, obj, ativo) => obj === c.source && ativo === controllerOf(c.g, c.source) }, text: 'Este artefato não desvira durante a sua etapa de desvirar.' }),
      triggered(on.upkeep('you'), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        if (yield* mayPay(c, c.you, '{4}', 'desvirar Mana Vault')) untap(c.g, c.source);
      }, { text: 'No início da sua manutenção, você pode pagar {4}. Se pagar, desvire este artefato.' }),
      // cláusula "se" interveniente (CR 603.4): conferida ao disparar e ao resolver
      triggered(on.step('draw', 'you'), function* (c) {
        dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: c.you }, amount: 1, combat: false }]);
      }, { condition: (c) => !!c.g.state.objects[c.source]?.tapped, text: 'No início da sua etapa de compra, se este artefato estiver virado, ele causa 1 de dano a você.' }),
      mana('CCC'),
    ],
  }],
  rulings: {},
});
