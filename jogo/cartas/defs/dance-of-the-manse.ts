// Dance of the Manse
// Return up to X target artifact and/or non-Aura enchantment cards each with mana value X or less from your graveyard to
// the battlefield. If X is 6 or more, those permanents are 4/4 creatures in addition to their other types.
import { addEffect, defineCard, isSubtype, isType, manaValue, putOntoBattlefield, removeEffect, t, tgtsAll } from '../../motor/api.ts';
import type { Mod } from '../../motor/types.ts';

export default defineCard({
  name: 'Dance of the Manse',
  faces: [{
    spell: {
      targets: [{
        ...t.card('graveyard', (c, id) => (isType(c.g, id, 'Artifact') || (isType(c.g, id, 'Enchantment') && !isSubtype(c.g, id, 'Aura')))
          && manaValue(c.g, id) <= ((c as { x?: number }).x ?? 99), 'cartas de artefato ou de encantamento que não é Aura alvo, com valor de mana X ou menos'),
        min: 0, max: (c) => c.x ?? 0,
      }],
      *effect(c) {
        const cartas = tgtsAll(c, 0).filter((id) => c.g.state.objects[id]?.zone === 'graveyard');
        if (!cartas.length) return;
        // ruling 2: com X 6 ou mais, entram já como criaturas 4/4 (CR 614.1c), e assim ficam (ruling 5: tripular não muda)
        const temporarios = c.x >= 6 ? cartas.map((id) => {
          const mods: Mod[] = [{ k: 'addTypes', types: ['Creature'] }, { k: 'setPT', p: 4, t: 4 }];
          return addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'endOfTurn' }, affected: null, mods: [{ k: 'rule', id: 'rule:spellGains', params: { spell: id, mods, controller: c.you, enquantoNoCampo: true } }] });
        }) : [];
        yield* putOntoBattlefield(c.g, cartas.map((id) => ({ id, controller: c.you })), 'effect');
        for (const e of temporarios) removeEffect(c.g, e.id);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 202.3e — X no custo de uma carta no cemitério vale 0 (motor/chars.ts)',
    2: 'teste: com X 6 ou mais, entram como criaturas 4/4 e assim ficam',
    3: 'teste: com X 6 ou mais, entram como criaturas 4/4 e assim ficam',
    4: 'regra geral: CR 301.5c — Equipamento que é criatura não pode equipar (motor/actions.ts attach)',
    5: 'teste: com X 6 ou mais, entram como criaturas 4/4 e assim ficam',
  },
});
