// Here Comes a New Hero!
// Target player draws X cards. Create a token that's a copy of up to one target creature with mana value X or less.
import { copiableValues, createTokens, defineCard, draw, manaValue, t, tgtPlayer, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Here Comes a New Hero!',
  faces: [{
    spell: {
      targets: [
        t.player(),
        // ruling 2: o X do custo da criatura no campo vale 0 para o valor de mana
        upTo(1, t.creature((c, id) => manaValue(c.g, id) <= ((c as { x?: number }).x ?? 0), 'criatura alvo com valor de mana X ou menos')),
      ],
      *effect(c) {
        const p = tgtPlayer(c);
        if (p !== null && c.x > 0) yield* draw(c.g, p, c.x);
        const r = c.targets[1]?.[0];
        if (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield') yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, r.id) }, 1);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 707.2 — a ficha tem as habilidades de entrar copiadas, e elas disparam (motor/actions.ts putOntoBattlefield)',
    2: 'regra geral: CR 707.2 — o X do custo de mana copiado vale 0, também no valor de mana da criatura no campo (motor/chars.ts)',
    3: 'regra geral: CR 707.2 — copia só os valores copiáveis: não copia estar virada, marcadores nem anexos (motor/mecanicas.ts copiableValues)',
    4: 'regra geral: CR 707.2 — copiando uma ficha, valem as características originais dela (motor/mecanicas.ts copiableValues)',
    5: 'regra geral: CR 707.3 — se a criatura é cópia de outra coisa, a ficha entra como o que ela copiou (motor/mecanicas.ts copiableValues)',
  },
});