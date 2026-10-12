// Winter Soldier, Reborn Avenger
// Whenever Winter Soldier attacks, return target creature card with mana value less than or equal to Winter Soldier's
// power from your graveyard to the battlefield. If a Hero enters this way, it enters with an additional +1/+1 counter on
// it.
import { chars, defineCard, lkiChars, manaValue, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';
import { ehHeroi } from '../vingadores.ts';

export default defineCard({
  name: 'Winter Soldier, Reborn Avenger',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        yield* putOntoBattlefield(c.g, [{ id, controller: c.you, counters: ehHeroi(c.g, id) ? { '+1/+1': 1 } : {} }], 'effect');
      }, {
        targets: [t.card('graveyard', (c, id) => chars(c.g, id).types.includes('Creature') && manaValue(c.g, id) <= (lkiChars(c.g, c.source)?.power ?? 0), 'carta de criatura alvo no seu cemitério com valor de mana até a força de Winter Soldier')],
        text: 'Sempre que Winter Soldier ataca, devolva ao campo a carta de criatura alvo com valor de mana menor ou igual à força de Winter Soldier do seu cemitério. Se um Hero entrar assim, ele entra com um marcador +1/+1 adicional.',
      }),
    ],
  }],
  rulings: {},
});