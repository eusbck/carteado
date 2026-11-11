// Kutzil, Malamet Exemplar
// Your opponents can't cast spells during your turn.
// Whenever one or more creatures you control each with power greater than its base power deals combat damage to a
// player, draw a card.
import { controllerOf, defineCard, draw, on, power, printedChars, staticAbility, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';

/** força maior que a força base (aproximação: a base é a impressa; efeitos de definir base não entram) */
export function acimaDaBase(g: G, id: ObjId): boolean {
  const o = g.state.objects[id];
  if (!o) return false;
  const base = o.token ? null : printedChars(o.def, o.face ?? 0, o.owner).power;
  return base !== null && power(g, id) > base;
}

export default defineCard({
  name: 'Kutzil, Malamet Exemplar',
  faces: [{
    abilities: [
      staticAbility({
        rules: { cantCastSpells: (c, p) => c.g.isOpponent(c.you, p) && c.g.state.turn.active === c.you },
        text: 'Seus oponentes não podem conjurar mágicas durante o seu turno.',
      }),
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'damage' && e.combat && e.target.kind === 'player'
        && controllerOf(c.g, e.source) === c.you && acimaDaBase(c.g, e.source))), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que uma ou mais criaturas que você controla, cada uma com força maior que a força base, causam dano de combate a um jogador, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 208.4 — a base é a impressa; simplificação: efeitos que definem a base (Wrecking Ball Arm) não mudam a comparação',
    2: 'regra geral: CR 604.3 — a CDA de força entra na base; as cartas dos decks com */* não têm CDA de força variável',
    3: 'teste: criatura com força acima da impressa dá a compra; sem bônus, não',
  },
});
