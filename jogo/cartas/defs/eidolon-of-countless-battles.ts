// Eidolon of Countless Battles
// Bestow {2}{W}{W} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a
// creature again if it's not attached.)
// This creature and enchanted creature each get +1/+1 for each creature you control and +1/+1 for each Aura you control.
import { controlledBy, defineCard, isCreature, isSubtype, staticAbility, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Eidolon of Countless Battles',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    altCosts: [{ key: 'bestow', label: 'bestow {2}{W}{W}', zone: 'hand', mana: '{2}{W}{W}', asAura: true }],
    abilities: [staticAbility({
      affects: (c, o) => o.id === c.source || c.g.state.objects[c.source]?.attachedTo === o.id,
      mods: (c) => {
        const n = controlledBy(c.g, c.you, (id) => isCreature(c.g, id)).length + controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Aura')).length;
        return [{ k: 'pt', p: n, t: n }];
      },
      text: 'Esta criatura e a criatura encantada recebem +1/+1 para cada criatura que você controla e +1/+1 para cada Aura que você controla.',
    })],
  }],
  rulings: {
    1: 'teste: solta, continua no campo como criatura',
    2: 'regra geral: CR 702.103e — mágica de bestow com alvo ilegal resolve como criatura (motor/stack.ts)',
    3: 'regra geral: CR 702.103 — Aura não vira junto com a criatura',
    4: 'regra geral: CR 702.103 — sem ser conjurada por bestow, entra como criatura',
    5: 'teste: na pilha por bestow é Aura, não criatura',
    6: 'teste: anexada conta só como Aura',
    7: 'regra geral: a habilidade estática só vale no campo',
  },
});
