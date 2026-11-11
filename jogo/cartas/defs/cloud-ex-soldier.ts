// Cloud, Ex-SOLDIER
// Haste
// When Cloud enters, attach up to one target Equipment you control to it.
// Whenever Cloud attacks, draw a card for each equipped attacking creature you control. Then if Cloud has power 7 or
// greater, create two Treasure tokens.
import { and, attach, chars, controllerOf, createTokens, defineCard, draw, etb, is, keyword, on, power, t, tgt, triggered, upTo } from '../../motor/api.ts';
import { atacantes } from '../vingadores.ts';

export default defineCard({
  name: 'Cloud, Ex-SOLDIER',
  faces: [{
    abilities: [
      keyword('haste'),
      // ruling 1: se o Equipamento não pode ser anexado a Cloud, nada acontece (motor/actions.ts attach)
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null && c.g.state.objects[c.source]?.zone === 'battlefield') attach(c.g, id, c.source);
      }, { targets: [upTo(1, t.permanent(and(is.yours, is.subtype('Equipment')), 'até um Equipamento alvo que você controla'))], text: 'Quando Cloud entra, anexe a ele até um Equipamento alvo que você controla.' }),
      triggered(on.selfAttacks(), function* (c) {
        const s = c.g.state;
        const n = atacantes(c.g).filter((id) => controllerOf(c.g, id) === c.you
          && s.zones.battlefield.some((x) => s.objects[x].attachedTo === id && chars(c.g, x).subtypes.includes('Equipment'))).length;
        if (n > 0) yield* draw(c.g, c.you, n);
        if (s.objects[c.source]?.zone === 'battlefield' && (power(c.g, c.source) ?? 0) >= 7) yield* createTokens(c.g, c.you, 'Treasure', 2);
      }, { text: 'Sempre que Cloud ataca, compre uma carta para cada criatura atacante equipada que você controla. Depois, se Cloud tiver força 7 ou mais, crie duas fichas de Tesouro.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 301.5c — o Equipamento que não pode ser anexado a Cloud não se move (motor/actions.ts attach)',
  },
});
