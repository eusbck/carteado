// Living Laser
// Haste
// Whenever Living Laser attacks, for each card you've discarded this turn, create a token that's a copy of Living Laser,
// except the token isn't legendary. The tokens enter tapped and attacking. Exile the tokens at the beginning of the next
// end step.
import { copyWithExcept, defineAbility, defineCard, delayed, exile, keyword, nextEndStepTrigger, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import type { ObjId, TargetRef } from '../../motor/types.ts';
import { escolheAtacado } from '../viloes.ts';

const EXILA = defineAbility('Living Laser:exila', nextEndStepTrigger(function* (c) {
  const ids = ((c.data.fichas as ObjId[] | undefined) ?? []).filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
  if (ids.length) yield* exile(c.g, ids);
}, 'Exile as fichas no início da próxima etapa final.'));

export default defineCard({
  name: 'Living Laser',
  faces: [{
    abilities: [
      keyword('haste'),
      triggered(on.selfAttacks(), function* (c) {
        const n = c.g.state.turnStats[c.you]?.cardsDiscarded ?? 0;
        if (n <= 0) return;
        // CR 707.9b: "não é lendária" faz parte dos valores copiáveis; cada ficha ataca quem você escolher (CR 508.4)
        const copia = copyWithExcept(c.g, c.source, { legendary: false });
        const reqs: { controller: number; token: { copyOf: typeof copia }; tapped: boolean; attacking?: TargetRef }[] = [];
        for (let i = 0; i < n; i++) {
          const alvo = yield* escolheAtacado(c, 'Living Laser');
          reqs.push({ controller: c.you, token: { copyOf: copia }, tapped: true, attacking: alvo ?? undefined });
        }
        const fichas = yield* putOntoBattlefield(c.g, reqs, 'token');
        if (fichas.length) delayed(c, EXILA.id!, { data: { fichas } });
      }, { text: 'Sempre que Living Laser ataca, para cada carta que você descartou neste turno, crie uma ficha que é uma cópia de Living Laser, exceto que a ficha não é lendária. As fichas entram viradas e atacando. Exile as fichas no início da próxima etapa final.' }),
    ],
  }],
  rulings: {},
});
