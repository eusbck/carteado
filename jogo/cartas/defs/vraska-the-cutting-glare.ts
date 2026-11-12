// Vraska, the Cutting Glare
// Deathtouch
// When Vraska enters, if you control six or more lands, destroy target permanent an opponent controls. They create a
// Treasure token.
import { controlledBy, controllerOf, createTokens, defineCard, destroy, etb, isLand, keyword, lkiObj, t, tgt, tgtRef } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const seisTerrenos = (c: SCtx) => controlledBy(c.g, c.you, (id) => isLand(c.g, id)).length >= 6;

export default defineCard({
  name: 'Vraska, the Cutting Glare',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      etb(function* (c) {
        const ref = tgtRef(c);
        const id = tgt(c);
        if (id === null || !ref || ref.kind !== 'obj') return;
        // "eles": o controlador da permanente destruída (o de agora, ou o último conhecido)
        const dono = c.g.state.objects[id] ? controllerOf(c.g, id) : lkiObj(c.g, id)?.controller;
        yield* destroy(c.g, [id]);
        if (dono !== undefined) yield* createTokens(c.g, dono, 'Treasure', 1);
      }, {
        // ruling 1: "se" interveniente (CR 603.4): confere ao disparar e ao resolver
        condition: (c) => seisTerrenos(c),
        targets: [t.permanent((c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id)), 'permanente alvo que um oponente controla')],
        text: 'Quando Vraska entra, se você controlar seis ou mais terrenos, destrua a permanente alvo que um oponente controla. Esse jogador cria uma ficha de Tesouro.',
      }),
    ],
  }],
  rulings: { 1: 'teste: com menos de seis terrenos, o gatilho não dispara' },
});
