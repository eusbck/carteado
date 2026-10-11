// Turtle Lair
// {T}: Add {C}.
// {T}: Add one mana of any color. Spend this mana only to cast a Ninja or Turtle spell.
// {3}, {T}: Target Ninja or Turtle can't be blocked this turn.
import { activated, chars, defineCard, defineFn, mana, t, tgt, untilEndOfTurn, type G } from '../../motor/api.ts';

const TIPOS = ['Ninja', 'Turtle'];

// CR 106.6: mana com restrição de gasto — só para conjurar mágica Ninja ou Turtle
const RESTRICAO = 'Turtle Lair:ninjaOuTurtle';
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) =>
  purpose.kind === 'spell' && purpose.obj !== undefined && chars(g, purpose.obj).subtypes.some((s) => TIPOS.includes(s)));

export default defineCard({
  name: 'Turtle Lair',
  faces: [{
    abilities: [
      mana('C'),
      mana('any', { restriction: RESTRICAO, text: '{T}: Adicione uma mana de qualquer cor. Gaste essa mana apenas para conjurar uma mágica Ninja ou Turtle.' }),
      // CR 509.1h: depois de bloqueada, a criatura continua bloqueada (ruling 1)
      activated('{3}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:cantBeBlocked' }]);
      }, {
        targets: [t.creature((ctx, id) => chars(ctx.g, id).subtypes.some((s) => TIPOS.includes(s)), 'Ninja ou Turtle alvo')],
        text: '{3}, {T}: O Ninja ou Turtle alvo não pode ser bloqueado neste turno.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 509.1h — depois de declarada bloqueada, a criatura continua bloqueada (o efeito só afeta declarações futuras)',
  },
});
