// Enduring Tenacity
// Whenever you gain life, target opponent loses that much life.
// When Enduring Tenacity dies, if it was a creature, return it to the battlefield under its owner's control. It's an
// enchantment. (It's not a creature.)
import { addEffect, defineCard, loseLife, on, putOntoBattlefield, t, tgtPlayer, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Enduring Tenacity',
  faces: [{
    abilities: [
      triggered(on.youGainLife(), function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) loseLife(c.g, p, c.event.amount as number, c.source);
      }, { targets: [t.opponent()], text: 'Sempre que você ganha vida, o oponente alvo perde essa quantidade de vida.' }),
      // "se era uma criatura": morrer já exige ser criatura (on.selfDies olha a última informação)
      triggered(on.selfDies(), function* (c) {
        const carta = c.event.obj as ObjId | undefined;
        const s = c.g.state;
        const id = carta !== undefined && s.objects[carta]?.zone === 'graveyard' ? carta : null;
        if (id === null) return;
        const dono = s.objects[id].owner;
        const [novo] = yield* putOntoBattlefield(c.g, [{ id, controller: dono }], 'effect');
        if (novo === null || novo === undefined || s.objects[novo]?.zone !== 'battlefield') return;
        // "é um encantamento (não é uma criatura)": perde o tipo criatura enquanto estiver no campo
        addEffect(c.g, { source: novo, sourceDef: '', controller: dono, affected: [novo], duration: { kind: 'whileOnBattlefield', obj: novo }, mods: [{ k: 'removeTypes', types: ['Creature'] }] });
      }, { text: 'Quando Enduring Tenacity morre, se era uma criatura, devolva-a ao campo de batalha sob o controle do dono. Ela é um encantamento (não é uma criatura).' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 400.7 — volta como objeto novo, sem marcadores',
    2: 'teste: volta como encantamento que não é criatura',
    3: 'regra geral: CR 603.10a — se ela não estiver mais no cemitério quando resolver, não volta',
  },
});
