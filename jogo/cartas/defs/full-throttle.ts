// Full Throttle
// After this main phase, there are two additional combat phases.
// At the beginning of each combat this turn, untap all creatures that attacked this turn.
import { addCombatPhaseAfterCurrent, defineAbility, defineCard, delayed, on, triggered, untap } from '../../motor/api.ts';

type Dados = { atacaram: number[] };
const dadosDe = (c: unknown) => (c as { delayed?: { data: Dados } }).delayed?.data;

// gatilho atrasado do turno: anota quem atacou (sem disparar) e desvira essas criaturas no início de cada combate
const DESVIRA = defineAbility('Full Throttle:desvirar', triggered(on.custom((e, c) => {
  const d = dadosDe(c);
  if (!d) return false;
  if (e.type === 'attackers') { for (const a of e.attackers) if (!d.atacaram.includes(a.obj)) d.atacaram.push(a.obj); return false; }
  return e.type === 'step' && e.step === 'beginCombat' && d.atacaram.length > 0;
}), function* (c) {
  for (const id of (c.data as Dados).atacaram) if (c.g.state.objects[id]?.zone === 'battlefield') untap(c.g, id);
}, { text: 'No início de cada combate neste turno, desvire todas as criaturas que atacaram neste turno.' }));

export default defineCard({
  name: 'Full Throttle',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1 e 2: só depois de uma fase principal; sem fase principal entre os dois combates
        const t = c.g.state.turn;
        if (t.step === 'main1' || t.step === 'main2') { addCombatPhaseAfterCurrent(c.g); addCombatPhaseAfterCurrent(c.g); }
        delayed(c, DESVIRA.id!, { data: { atacaram: [] }, once: false, expiresTurn: t.number });
      },
    },
  }],
  rulings: {
    1: 'teste: depois da fase principal vêm dois combates a mais, e quem atacou desvira no início de cada um',
    2: 'regra geral: CR 505.1 — fora de uma fase principal não há combates a mais, mas o desvirar continua valendo (efeito acima)',
  },
});
