// Full Throttle
// After this main phase, there are two additional combat phases.
// At the beginning of each combat this turn, untap all creatures that attacked this turn.
import { addCombatPhaseAfterCurrent, defineAbility, defineCard, delayed, isCreature, on, triggered, untap } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// "no início de cada combate neste turno": gatilho atrasado que dispara a cada etapa de início de combate do turno
const DESVIRA = defineAbility('Full Throttle:desvira', triggered(on.custom((e) => e.type === 'step' && e.step === 'beginCombat'), function* (c) {
  const s = c.g.state;
  // criaturas declaradas atacantes neste turno, por qualquer jogador, que ainda estão no campo (o mesmo objeto)
  const ids = new Set<ObjId>(Object.values(s.turnStats).flatMap((ts) => ts.attackersThisTurn ?? []));
  for (const id of ids) if (s.objects[id]?.zone === 'battlefield' && isCreature(c.g, id)) untap(c.g, id);
}, { text: 'No início de cada combate neste turno, desvire todas as criaturas que atacaram neste turno.' }));

export default defineCard({
  name: 'Full Throttle',
  faces: [{
    spell: {
      *effect(c) {
        const passo = c.g.state.turn.step;
        // CR 500.8; ruling 1: sem fase principal entre os dois combates adicionais; ruling 2: fora de uma fase
        // principal, não há combates adicionais (no turno do oponente, é ele quem ataca neles)
        if (passo === 'main1' || passo === 'main2') {
          addCombatPhaseAfterCurrent(c.g);
          addCombatPhaseAfterCurrent(c.g);
        }
        delayed(c, DESVIRA.id!, { once: false, expiresTurn: c.g.state.turn.number });
      },
    },
  }],
  rulings: {
    1: 'teste: conjurada na segunda fase principal, vai direto à etapa final depois dos dois combates adicionais',
    2: 'teste: fora de uma fase principal, só o desvirar vale; não há combates adicionais',
  },
});
