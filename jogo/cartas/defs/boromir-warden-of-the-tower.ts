// Boromir, Warden of the Tower
// Vigilance
// Whenever an opponent casts a spell, if no mana was spent to cast it, counter that spell.
// Sacrifice Boromir: Creatures you control gain indestructible until end of turn. The Ring tempts you.
import { activated, counter, creaturesOf, defineCard, keyword, on, ringTempts, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';
import { ANEL } from '../mordor.ts';

/** nenhuma mana foi gasta para conjurar a mágica (inclui custos adicionais pagos com mana: ruling 2) */
function semMana(g: G, id: ObjId): boolean {
  const o = g.state.objects[id];
  return !!o && o.zone === 'stack' && o.stack?.kind === 'spell' && (o.stack.manaSpent?.total ?? 0) === 0;
}

export default defineCard({
  name: 'Boromir, Warden of the Tower',
  faces: [{
    abilities: [
      keyword('vigilance'),
      // CR 603.4: "se" interveniente, conferido ao disparar e ao resolver
      triggered(on.custom((e, c) => (e.type === 'cast' && c.g.isOpponent(c.you, e.player) ? { spell: e.obj } : false)), function* (c) {
        yield* counter(c.g, c.event.spell as ObjId);
      }, {
        condition: (c) => semMana(c.g, (c as { event?: { spell?: ObjId } }).event?.spell ?? -1),
        text: 'Sempre que um oponente conjura uma mágica, se nenhuma mana foi gasta para conjurá-la, anule aquela mágica.',
      }),
      // CR 611.2c: o efeito vale para as criaturas que você controla quando a habilidade resolve
      activated([{ k: 'sacrificeSelf' }], function* (c) {
        untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'addKeyword', kw: 'indestructible' }]);
        yield* ringTempts(c.g, c.you);
      }, { text: 'Sacrifique Boromir: As criaturas que você controla ganham indestrutível até o fim do turno. O Anel tenta você.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 601.2i — a mágica é conjurada antes do gatilho; os gatilhos de conjurar e as contagens valem (motor/stack.ts castSpell)',
    2: 'teste: mágica conjurada com mana não é anulada; sem mana nenhuma, é',
    3: ANEL.emblema,
    4: ANEL.semCriatura,
    5: ANEL.mesmo,
    6: ANEL.ordem,
    7: ANEL.obrigatorio,
    8: ANEL.um,
    9: ANEL.alvos,
  },
});
