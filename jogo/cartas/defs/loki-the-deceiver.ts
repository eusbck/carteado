// Loki, the Deceiver
// Whenever Loki attacks, create a tapped and attacking token that's a copy of another target Villain you control, except
// it isn't legendary and it's an Illusion in addition to its other types. Sacrifice that token at the beginning of the
// next end step.
// Whenever one or more Villains you control deal combat damage to a player, draw a card.
import { and, controllerOf, copyWithExcept, defineAbility, defineCard, delayed, draw, is, isSubtype, nextEndStepTrigger, on, putOntoBattlefield, sacrifice, t, tgt, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { escolheAtacado } from '../viloes.ts';

const SACRIFICA = defineAbility('Loki, the Deceiver:sacrifica', nextEndStepTrigger(function* (c) {
  const id = c.data.ficha as ObjId;
  if (c.g.state.objects[id]?.zone === 'battlefield') yield* sacrifice(c.g, [id]);
}, 'Sacrifique a ficha no início da próxima etapa final.'));

export default defineCard({
  name: 'Loki, the Deceiver',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // CR 707.9b: as exceções fazem parte dos valores copiáveis; a ficha ataca quem você escolher (CR 508.4)
        const copia = copyWithExcept(c.g, id, { legendary: false, addSubtypes: ['Illusion'] });
        const alvo = yield* escolheAtacado(c, 'Loki');
        const [ficha] = yield* putOntoBattlefield(c.g, [{ controller: c.you, token: { copyOf: copia }, tapped: true, attacking: alvo ?? undefined }], 'token');
        if (ficha !== undefined) delayed(c, SACRIFICA.id!, { data: { ficha } });
      }, {
        targets: [t.permanent(and(is.yours, is.other, is.subtype('Villain')), 'outro Villain alvo que você controla')],
        text: 'Sempre que Loki ataca, crie uma ficha virada e atacando que é uma cópia de outro Villain alvo que você controla, exceto que não é lendária e é uma Illusion além dos outros tipos. Sacrifique essa ficha no início da próxima etapa final.',
      }),
      // um gatilho por jogador que tomou dano de combate dos seus Villains no mesmo lote
      triggered(on.batch((evs, c) => {
        const jogadores = new Set<number>();
        for (const e of evs) {
          if (e.type !== 'damage' || !e.combat || e.target.kind !== 'player') continue;
          const o = c.g.state.objects[e.source];
          if (o && o.zone === 'battlefield' && controllerOf(c.g, e.source) === c.you && isSubtype(c.g, e.source, 'Villain')) jogadores.add(e.target.id);
        }
        return [...jogadores].map((jogador) => ({ jogador }));
      }), function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Sempre que um ou mais Villains que você controla causam dano de combate a um jogador, compre uma carta.' }),
    ],
  }],
  rulings: {},
});
