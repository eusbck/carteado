// Spell Shrivel
// Devoid (This card has no color.)
// Counter target spell unless its controller pays {4}. If that spell is countered this way, exile it instead of putting
// it into its owner's graveyard.
import { defineCard, t, tgt } from '../../motor/api.ts';
import { anulaAMenosQuePague } from '../naoanula.ts';

export default defineCard({
  name: 'Spell Shrivel',
  faces: [{
    spell: {
      targets: [t.spell()],
      *effect(c) {
        const id = tgt(c);
        // CR 118.12a; anulada assim, vai para o exílio em vez do cemitério
        if (id !== null) yield* anulaAMenosQuePague(c, id, '{4}', 'Spell Shrivel', { exilar: true });
      },
    },
  }],
  rulings: {
    1: 'não se aplica: descreve a moldura da carta',
    2: 'teste: devoid: a carta é incolor',
    3: 'regra geral: CR 702.114a, 105.2 — um efeito que dá cor substitui o incolor (motor/chars.ts)',
    4: 'regra geral: CR 702.114a — devoid vale em todas as zonas (motor/oracle.ts)',
    5: 'regra geral: CR 613.1e, 702.114a — a cor é definida antes de perder a habilidade (motor/oracle.ts)',
  },
});
