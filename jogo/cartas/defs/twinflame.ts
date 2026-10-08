// Twinflame
// Strive — This spell costs {2}{R} more to cast for each target beyond the first.
// Choose any number of target creatures you control. For each of them, create a token that's a copy of that creature,
// except it has haste. Exile those tokens at the beginning of the next end step.
import { copiableValues, createTokens, defineAbility, defineCard, delayed, exile, is, nextEndStepTrigger, t } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const EXILA = defineAbility('Twinflame:exila', nextEndStepTrigger(function* (c) {
  // ruling 3: só as fichas criadas por Twinflame
  const fichas = (c.data.fichas as ObjId[]).filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
  if (fichas.length) yield* exile(c.g, fichas);
}, 'No início da próxima etapa final, exile as fichas criadas por Twinflame.'));

export default defineCard({
  name: 'Twinflame',
  faces: [{
    // rulings 2, 6: Strive é aumento de custo; o valor de mana não muda e vale mesmo sem pagar o custo de mana
    selfCost: (_c, info) => {
      const n = (info.targets[0] ?? []).length;
      return n > 1 ? { add: '{2}{R}'.repeat(n - 1) } : {};
    },
    spell: {
      // ruling 12: qualquer número de alvos, inclusive zero, sem repetir
      targets: [{ ...t.creature(is.yours, 'criaturas alvo que você controla'), min: 0, max: 99 }],
      *effect(c) {
        const fichas: ObjId[] = [];
        // ruling 10: só os alvos ainda legais
        for (const r of c.targets[0] ?? []) {
          if (!r || r.kind !== 'obj' || c.g.state.objects[r.id]?.zone !== 'battlefield') continue;
          const v = copiableValues(c.g, r.id);
          // rulings 1, 4-5, 8-9, 11: valores copiáveis, com ímpeto como exceção da cópia (CR 707.9b)
          const ex = { ...(v.except ?? {}), addKeywords: [...(v.except?.addKeywords ?? []), 'haste'] };
          fichas.push(...(yield* createTokens(c.g, c.you, { copyOf: { ...v, except: ex } }, 1)));
        }
        if (fichas.length) delayed(c, EXILA.id!, { data: { fichas } });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 707.5 — habilidades de entrar da cópia funcionam',
    2: 'regra geral: CR 202.3 — o valor de mana não muda',
    3: 'regra geral: CR 707.9b — o ímpeto faz parte da cópia; só as fichas de Twinflame são exiladas',
    4: 'regra geral: CR 603.6a — as fichas se veem entrar',
    5: 'regra geral: CR 707.9 — X vale 0',
    6: 'regra geral: CR 601.2f — o aumento é pago mesmo sem pagar o custo de mana',
    7: 'regra geral: CR 707.10c — a cópia mantém o número de alvos',
    8: 'regra geral: CR 707.2 — ficha copia os valores originais da ficha',
    9: 'regra geral: CR 707.3 — copia o que a criatura estiver copiando',
    10: 'regra geral: CR 608.2b — só os alvos legais',
    11: 'regra geral: CR 707.2 — sem marcadores nem efeitos',
    12: 'teste: dois alvos custam {2}{R} a mais',
  },
});
