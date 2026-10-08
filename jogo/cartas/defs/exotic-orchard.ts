// Exotic Orchard
// {T}: Add one mana of any color that a land an opponent controls could produce.
import { defineCard, mana, opponentLandColors } from '../../motor/api.ts';
import type { ManaAbilityDef } from '../../motor/defs.ts';
import type { ManaType } from '../../motor/types.ts';

// CR 106.7: as cores que um terreno de oponente "poderia produzir"; terrenos que dependem
// de outros só ajudam se algum deles produzir de fato (ruling 4), por isso a busca evita ciclos
const habilidade = mana((c) => opponentLandColors(c.g, c.you).map((t) => [t]), { text: '{T}: Adicione uma mana de qualquer cor que um terreno de um oponente poderia produzir.' }) as ManaAbilityDef & { couldProduce: (g: import('../../motor/game-context.ts').G, id: number, v: Set<number>) => ManaType[] };
habilidade.couldProduce = (g, id, visiting) => opponentLandColors(g, g.state.objects[id] ? (g.state.objects[id].controller) : 0, visiting);

export default defineCard({
  name: 'Exotic Orchard',
  faces: [{ abilities: [habilidade] }],
  rulings: {
    1: 'regra geral: só importam as cores (CR 106.7); restrições do terreno do oponente não passam',
    2: 'teste: considera as habilidades dos terrenos do oponente, sem olhar custos',
    3: 'não se aplica: nenhuma carta dos decks substitui a mana produzida por terrenos',
    4: 'teste: Exotic Orchards um contra o outro não produzem mana sozinhos',
    5: 'teste: nunca produz incolor',
  },
});
