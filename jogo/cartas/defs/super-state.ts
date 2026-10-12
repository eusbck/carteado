// Super State
// Enchant creature you control
// Enchanted creature has base power and toughness 9/9 and has flying, first strike, trample, and haste.
// Whenever enchanted creature deals combat damage to an opponent, it deals that much damage to each other opponent.
import { attachedGets, dealDamage, defineCard, is, t, triggered } from '../../motor/api.ts';
import { anexadaCausaDanoDeCombateAJogador } from '../jin.ts';

export default defineCard({
  name: 'Super State',
  faces: [{
    enchant: t.creature(is.yours, 'criatura que você controla'),
    abilities: [
      attachedGets(() => [{ k: 'setPT', p: 9, t: 9 }, { k: 'addKeyword', kw: 'flying' }, { k: 'addKeyword', kw: 'first strike' }, { k: 'addKeyword', kw: 'trample' }, { k: 'addKeyword', kw: 'haste' }],
        'A criatura encantada tem força e resistência base 9/9 e tem voar, iniciativa, atropelar e ímpeto.'),
      triggered(anexadaCausaDanoDeCombateAJogador(), function* (c) {
        const ferido = c.event.jogador as number;
        const criatura = c.event.criatura as number;
        const outros = c.g.opponents(c.you).filter((p) => p !== ferido);
        // a fonte do dano é a criatura encantada
        if (outros.length) dealDamage(c.g, outros.map((p) => ({ source: criatura, target: { kind: 'player' as const, id: p }, amount: Number(c.event.dano), combat: false })));
      }, {
        condition: (c) => c.g.isOpponent(c.you, c.event.jogador as number),
        text: 'Sempre que a criatura encantada causa dano de combate a um oponente, ela causa essa quantidade de dano a cada outro oponente.',
      }),
    ],
  }],
  rulings: {},
});