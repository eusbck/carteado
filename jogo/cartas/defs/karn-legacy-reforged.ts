// Karn, Legacy Reforged
// Karn's power and toughness are each equal to the greatest mana value among artifacts you control.
// At the beginning of your upkeep, add {C} for each artifact you control. This mana can't be spent to cast nonartifact
// spells. Until end of turn, you don't lose this mana as steps and phases end.
import { addMana, controlledBy, defineCard, defineFn, isType, manaValue, on, selfGets, triggered, type G } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

const RESTRICAO = 'Karn, Legacy Reforged:semNaoArtefato';
// ruling 1: pode pagar habilidades e mágicas de artefato; só não mágicas que não sejam de artefato
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) => purpose.kind !== 'spell' || (purpose.obj !== undefined && isType(g, purpose.obj, 'Artifact')));

export default defineCard({
  name: 'Karn, Legacy Reforged',
  faces: [{
    abilities: [
      // CR 604.3: CDA
      selfGets((c) => {
        const n = Math.max(0, ...controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')).map((id) => manaValue(c.g, id)));
        return [{ k: 'setPT', p: n, t: n }];
      }, 'A força e a resistência de Karn são iguais ao maior valor de mana entre os artefatos que você controla.', { cda: true }),
      triggered(on.upkeep('you'), function* (c) {
        const n = controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')).length;
        if (n > 0) addMana(c.g, c.you, Array<ManaType>(n).fill('C'), { source: c.source, restriction: RESTRICAO, untilEndOfTurn: true });
      }, { text: 'No início da sua manutenção, adicione {C} para cada artefato que você controla. Essa mana não pode ser gasta para conjurar mágicas que não sejam de artefato. Até o fim do turno, você não perde essa mana quando as etapas e fases terminam.' }),
    ],
  }],
  rulings: {
    1: 'teste: a mana paga mágicas de artefato e habilidades, mas não mágicas que não sejam de artefato',
    2: 'regra geral: CR 604.3 — a força e a resistência valem em todas as zonas',
    3: 'regra geral: CR 106.4 — a mana fica até o fim do turno',
  },
});
