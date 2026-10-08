// Starfield Mystic
// Enchantment spells you cast cost {1} less to cast.
// Whenever an enchantment you control is put into a graveyard from the battlefield, put a +1/+1 counter on this creature.
import { addCounters, defineCard, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Starfield Mystic',
  faces: [{
    abilities: [
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.types.includes('Enchantment') ? { reduce: 1 } : null) },
        text: 'As mágicas de encantamento que você conjura custam {1} a menos.',
      }),
      // ruling 1: Aura sua presa ao permanente de um oponente continua sendo sua
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard') return false;
        const l = c.g.state.lki[e.old];
        return !!l && l.chars.types.includes('Enchantment') && l.chars.controller === c.you;
      }), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que um encantamento que você controla vai do campo para um cemitério, coloque um marcador +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: { 1: 'teste: Aura sua na criatura de um oponente conta quando vai ao cemitério' },
});
