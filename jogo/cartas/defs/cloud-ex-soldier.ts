// Cloud, Ex-SOLDIER
// Haste
// When Cloud enters, attach up to one target Equipment you control to it.
// Whenever Cloud attacks, draw a card for each equipped attacking creature you control. Then if Cloud has power 7 or
// greater, create two Treasure tokens.
import { and, attach, chars, controllerOf, createTokens, defineCard, draw, etb, is, keyword, on, power, t, tgt, triggered, upTo } from '../../motor/api.ts';
import { equipada } from '../armaria.ts';

export default defineCard({
  name: 'Cloud, Ex-SOLDIER',
  faces: [{
    abilities: [
      keyword('haste'),
      etb(function* (c) {
        const eq = tgt(c);
        // ruling 1: só se o Equipamento puder se anexar a Cloud
        if (eq !== null && c.g.state.objects[c.source]?.zone === 'battlefield') attach(c.g, eq, c.source);
      }, {
        targets: [upTo(1, t.permanent(and(is.yours, (cc, id) => chars(cc.g, id).subtypes.includes('Equipment')), 'até um Equipamento alvo que você controla'))],
        text: 'Quando Cloud entra, anexe a ele até um Equipamento alvo que você controla.',
      }),
      triggered(on.selfAttacks(), function* (c) {
        const n = (c.g.state.combat?.attackers ?? []).filter((a) => !a.removed && c.g.state.objects[a.id] && controllerOf(c.g, a.id) === c.you && equipada(c.g, a.id)).length;
        if (n > 0) yield* draw(c.g, c.you, n);
        if (c.g.state.objects[c.source]?.zone === 'battlefield' && power(c.g, c.source) >= 7) yield* createTokens(c.g, c.you, 'Treasure', 2);
      }, { text: 'Sempre que Cloud ataca, compre uma carta para cada criatura atacante equipada que você controla. Depois, se Cloud tiver força 7 ou mais, crie duas fichas de Treasure.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 701.3b — Equipamento que não pode se anexar fica onde está (motor/actions.ts attach)' },
});
