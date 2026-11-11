// Thassa, Deep-Dwelling
// Indestructible
// As long as your devotion to blue is less than five, Thassa isn't a creature.
// At the beginning of your end step, exile up to one other target creature you control, then return that card to the
// battlefield under your control.
// {3}{U}: Tap another target creature.
import { activated, and, defineCard, is, keyword, on, staticAbility, t, tap, tgt, triggered, upTo } from '../../motor/api.ts';
import { piscar } from '../borg.ts';
import { DEVOCAO, devocao } from '../milagres.ts';

export default defineCard({
  name: 'Thassa, Deep-Dwelling',
  faces: [{
    abilities: [
      keyword('indestructible'),
      // CR 700.5; a condição fica em `affects` (o motor acha a camada pelos mods)
      staticAbility({
        affects: (c, o) => o.id === c.source && devocao(c.g, c.you, ['U']) < 5,
        mods: () => [{ k: 'removeTypes', types: ['Creature'] }],
        text: 'Enquanto a sua devoção ao azul for menor que cinco, Thassa não é uma criatura.',
      }),
      triggered(on.endStep('you'), function* (c) { const id = tgt(c); if (id !== null) yield* piscar(c, id, 'voce'); }, {
        targets: [upTo(1, t.creature(and(is.yours, is.other), 'outra criatura alvo que você controla'))],
        text: 'No início da sua etapa final, exile até uma outra criatura alvo que você controla e depois devolva essa carta ao campo de batalha sob o seu controle.',
      }),
      activated('{3}{U}', function* (c) { const id = tgt(c); if (id !== null) tap(c.g, id); }, {
        targets: [t.creature(is.other, 'outra criatura alvo')], text: '{3}{U}: Vire outra criatura alvo.',
      }),
    ],
  }],
  rulings: {
    1: DEVOCAO.semGenerico, 2: DEVOCAO.soCusto, 3: DEVOCAO.hibridos, 4: DEVOCAO.aura,
  },
});
