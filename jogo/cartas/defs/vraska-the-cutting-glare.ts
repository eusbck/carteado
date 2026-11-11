// Vraska, the Cutting Glare
// Deathtouch
// When Vraska enters, if you control six or more lands, destroy target permanent an opponent controls. They create a
// Treasure token.
import { controllerOf, createTokens, defineCard, destroy, etb, is, keyword, t, tgt } from '../../motor/api.ts';
import { terrenosDe } from '../terras.ts';

export default defineCard({
  name: 'Vraska, the Cutting Glare',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      // CR 603.4: condição interveniente
      etb(function* (c) {
        const id = tgt(c);
        if (id === null || terrenosDe(c.g, c.you).length < 6) return;
        const dono = controllerOf(c.g, id);
        yield* destroy(c.g, [id]);
        yield* createTokens(c.g, dono, 'Treasure', 1);
      }, {
        condition: (c) => terrenosDe(c.g, c.you).length >= 6,
        targets: [t.permanent(is.opponents, 'permanente alvo que um oponente controla')],
        text: 'Quando Vraska entra, se você controlar seis ou mais terrenos, destrua o permanente alvo que um oponente controla. Ele cria uma ficha de Tesouro.',
      }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 603.4 — confere os seis terrenos ao disparar e ao resolver' },
});
