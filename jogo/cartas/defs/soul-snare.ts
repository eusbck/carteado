// Soul Snare
// {W}, Sacrifice this enchantment: Exile target creature that's attacking you or a planeswalker you control.
import { activated, attackingTarget, controllerOf, defineCard, exile, isType, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Soul Snare',
  faces: [{
    abilities: [
      // ruling 1: o sacrifício é custo
      activated('{W}, Sacrifice this enchantment', function* (c) {
        // ruling 2: o alvo é conferido de novo na resolução (se o planeswalker atacado saiu, o alvo é ilegal)
        const id = tgt(c);
        if (id !== null) yield* exile(c.g, [id]);
      }, {
        targets: [t.creature((c, id) => {
          const alvo = attackingTarget(c.g, id);
          return alvo !== null && ((alvo.kind === 'player' && alvo.id === c.you) || (alvo.kind === 'obj' && isType(c.g, alvo.id, 'Planeswalker') && controllerOf(c.g, alvo.id) === c.you));
        }, 'criatura alvo que está atacando você ou um planeswalker que você controla')],
        text: '{W}, Sacrifique este encantamento: Exile a criatura alvo que está atacando você ou um planeswalker que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: sacrificado, exila a criatura que está atacando você',
    2: 'regra geral: CR 608.2b — o alvo é conferido de novo na resolução; sem o planeswalker atacado, a criatura deixa de ser alvo legal (motor/combat.ts attackingTarget)',
  },
});