// Electric Seaweed
// Defender, haste
// When this creature enters, until end of turn, whenever another creature dies, this creature deals 1 damage to each
// non-Wall creature.
// {T}: This creature deals 1 damage to any target.
import { activated, allCreatures, chars, dealDamage, defineAbility, defineCard, delayed, etb, keyword, lkiChars, on, t, triggered } from '../../motor/api.ts';

const MORRE = defineAbility('Electric Seaweed:morre', triggered(on.custom((e, c) => e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && e.old !== c.source && !!lkiChars(c.g, e.old)?.types.includes('Creature')), function* (c) {
  const ids = allCreatures(c.g).filter((id) => !chars(c.g, id).subtypes.includes('Wall'));
  if (ids.length) dealDamage(c.g, ids.map((id) => ({ source: c.source, target: { kind: 'obj' as const, id }, amount: 1, combat: false })));
}, { text: 'Sempre que outra criatura morre, esta criatura causa 1 de dano a cada criatura que não é Wall.' }));

export default defineCard({
  name: 'Electric Seaweed',
  faces: [{
    abilities: [
      keyword('defender'),
      keyword('haste'),
      etb(function* (c) { delayed(c, MORRE.id!, { once: false, expiresTurn: c.g.state.turn.number }); }, { text: 'Quando esta criatura entra, até o fim do turno, sempre que outra criatura morre, esta criatura causa 1 de dano a cada criatura que não é Wall.' }),
      activated('{T}', function* (c) {
        const r = c.targets[0]?.[0];
        if (r) dealDamage(c.g, [{ source: c.source, target: r, amount: 1, combat: false }]);
      }, { targets: [t.any()], text: '{T}: Esta criatura causa 1 de dano a qualquer alvo.' }),
    ],
  }],
  rulings: {},
});