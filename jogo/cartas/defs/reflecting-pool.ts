// Reflecting Pool
// {T}: Add one mana of any type that a land you control could produce.
import { controllerOf, couldProduce, defineCard, isLand, mana } from '../../motor/api.ts';
import type { ManaAbilityDef } from '../../motor/defs.ts';
import type { G } from '../../motor/game-context.ts';
import type { ManaType, ObjId, PlayerId } from '../../motor/types.ts';

/**
 * CR 106.7: os tipos de mana (incluindo incolor, CR 106.1b) que os terrenos do jogador poderiam produzir,
 * olhando as habilidades de mana atuais sem checar custos nem se dá para ativar (rulings 1, 3, 4).
 * Os terrenos já visitados ficam de fora, para que Reflecting Pools não se ajudem (ruling 2).
 */
function tiposDosSeusTerrenos(g: G, p: PlayerId, visiting: Set<ObjId>): ManaType[] {
  const out = new Set<ManaType>();
  for (const id of g.state.zones.battlefield) {
    if (g.state.objects[id].phasedOut || !isLand(g, id) || controllerOf(g, id) !== p) continue;
    for (const t of couldProduce(g, id, visiting)) out.add(t);
  }
  return (['W', 'U', 'B', 'R', 'G', 'C'] as ManaType[]).filter((t) => out.has(t));
}

// ruling 5: a mana sai sem restrições nem efeitos extras dos outros terrenos (é só o tipo)
const habilidade = mana((c) => tiposDosSeusTerrenos(c.g, c.you, new Set([c.source])).map((t) => [t]), {
  text: '{T}: Adicione uma mana de qualquer tipo que um terreno que você controla poderia produzir.',
}) as ManaAbilityDef & { couldProduce: (g: G, id: ObjId, v: Set<ObjId>) => ManaType[] };
// o que esta Reflecting Pool "poderia produzir" para outras cartas (Exotic Orchard, Fellwar Stone, outra Pool)
habilidade.couldProduce = (g, id, visiting) => tiposDosSeusTerrenos(g, controllerOf(g, id), visiting);

export default defineCard({
  name: 'Reflecting Pool',
  faces: [{ abilities: [habilidade] }],
  rulings: {
    1: 'teste: considera as habilidades de mana dos seus terrenos, sem olhar custos nem se estão virados',
    2: 'teste: Reflecting Pools não se ajudam a produzir mana',
    3: 'teste: habilidades concedidas a um terreno mudam o que ele poderia produzir',
    4: 'teste: produz incolor se um terreno seu produz {C}',
    5: 'teste: a mana não leva as restrições nem os efeitos extras dos outros terrenos',
  },
});
