// Squandered Resources
// Sacrifice a land: Add one mana of any type the sacrificed land could produce.
import { defineCard, mana } from '../../motor/api.ts';
import type { ManaAbilityDef } from '../../motor/defs.ts';
import type { ManaType } from '../../motor/types.ts';
import { sacrificaTerrenoCusto, terrenosDe } from '../terras.ts';
import { chars } from '../../motor/api.ts';

// simplificação: oferece as cores das habilidades de mana dos seus terrenos (o tipo que cada um "poderia produzir")
const MANA: ManaAbilityDef = {
  ...mana((c) => {
    const tipos = new Set<ManaType>();
    for (const id of terrenosDe(c.g, c.you)) {
      const ch = chars(c.g, id);
      for (const st of ch.subtypes) { const m = ({ Plains: 'W', Island: 'U', Swamp: 'B', Mountain: 'R', Forest: 'G' } as Record<string, ManaType>)[st]; if (m) tipos.add(m); }
    }
    if (!tipos.size) tipos.add('C');
    return [...tipos].map((x) => [x]);
  }, { text: 'Sacrifique um terreno: Adicione uma mana de qualquer tipo que o terreno sacrificado poderia produzir.' }),
  cost: [sacrificaTerrenoCusto],
};

export default defineCard({ name: 'Squandered Resources', faces: [{ abilities: [MANA] }], rulings: { 1: 'regra geral: CR 106.7 — olha os tipos de mana que o terreno poderia produzir' } });
