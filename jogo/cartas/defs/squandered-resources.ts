// Squandered Resources
// Sacrifice a land: Add one mana of any type the sacrificed land could produce.
import { controllerOf, couldProduce, defineCard, isLand, sacrificarTerrenoAnotandoMana } from '../../motor/api.ts';
import type { ManaAbilityDef } from '../../motor/defs.ts';
import type { ManaType } from '../../motor/types.ts';

const TIPOS: ManaType[] = ['W', 'U', 'B', 'R', 'G', 'C'];

const HABILIDADE: ManaAbilityDef = {
  kind: 'mana',
  cost: [sacrificarTerrenoAnotandoMana()],
  // estimativa para o planejamento: o que algum terreno seu poderia produzir
  produce: (c) => {
    const tipos = new Set<ManaType>();
    for (const id of c.g.state.zones.battlefield) if (isLand(c.g, id) && controllerOf(c.g, id) === c.you) for (const t of couldProduce(c.g, id)) tipos.add(t);
    const alts = TIPOS.filter((t) => tipos.has(t)).map((t) => [t]);
    // ruling 1: dá para sacrificar um terreno que não produz mana (e não ganhar nada); a opção aparece mesmo assim
    return alts.length ? alts : c.g.state.zones.battlefield.some((id) => isLand(c.g, id) && controllerOf(c.g, id) === c.you) ? [['C']] : [];
  },
  // CR 106.7: o que o terreno sacrificado poderia produzir quando foi sacrificado (motor/terrenos.ts)
  produceFromCost: (_c, info) => ((info.tiposDoSacrificado as ManaType[] | undefined) ?? []).map((t) => [t]),
  // não entra no pagamento automático (sacrificaria terrenos por conta própria): ative antes de pagar
  notWhilePaying: true,
  text: 'Sacrifique um terreno: Adicione uma mana de qualquer tipo que o terreno sacrificado poderia produzir.',
};

export default defineCard({
  name: 'Squandered Resources',
  faces: [{ abilities: [HABILIDADE] }],
  rulings: { 1: 'teste: um terreno que não produz mana pode ser sacrificado, mas não dá mana' },
});
