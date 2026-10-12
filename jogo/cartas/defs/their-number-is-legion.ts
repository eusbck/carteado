// Their Number Is Legion
// Create X tapped 2/2 black Necron Warrior artifact creature tokens, then you gain life equal to the number of artifacts
// you control. Exile Their Number Is Legion.
// You may cast this card from your graveyard.
import { defineCard, exile, gainLife } from '../../motor/api.ts';
import { criaNecronWarriors } from '../necrons.ts';
import { artefatosDe } from '../wakanda.ts';

export default defineCard({
  name: 'Their Number Is Legion',
  faces: [{
    // ruling 1: do cemitério, pelo custo normal e no tempo normal
    altCosts: [{ key: 'cemiterio', label: 'conjurar do cemitério', zone: 'graveyard', mana: '{X}{B}{B}{B}{B}' }],
    spell: {
      *effect(c) {
        yield* criaNecronWarriors(c, c.x, true);
        const n = artefatosDe(c.g, c.you).length;
        if (n > 0) gainLife(c.g, c.you, n, c.source);
        if (c.g.state.objects[c.source]) yield* exile(c.g, [c.source]);
      },
    },
  }],
  rulings: { 1: 'teste: conjurada do cemitério pelo custo normal; cria X Necron Warriors virados, ganha vida pelos artefatos e é exilada' },
});