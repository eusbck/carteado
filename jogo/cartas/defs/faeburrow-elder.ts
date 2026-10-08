// Faeburrow Elder
// Vigilance
// This creature gets +1/+1 for each color among permanents you control.
// {T}: For each color among permanents you control, add one mana of that color.
import { chars, controlledBy, defineCard, keyword, mana, selfGets, type G } from '../../motor/api.ts';
import type { ManaType, PlayerId } from '../../motor/types.ts';

// ruling 1: só as cinco cores contam ("multicolorido" e "incolor" não são cores)
function cores(g: G, p: PlayerId): ManaType[] {
  const s = new Set<string>();
  for (const id of controlledBy(g, p, () => true)) for (const cor of chars(g, id).colors) s.add(cor);
  return (['W', 'U', 'B', 'R', 'G'] as ManaType[]).filter((x) => s.has(x));
}

export default defineCard({
  name: 'Faeburrow Elder',
  faces: [{
    abilities: [
      keyword('vigilance'),
      selfGets((c) => { const n = cores(c.g, c.you).length; return [{ k: 'pt', p: n, t: n }]; }, 'Esta criatura recebe +1/+1 para cada cor entre os permanentes que você controla.'),
      mana((c) => [cores(c.g, c.you)], { text: '{T}: Para cada cor entre os permanentes que você controla, adicione uma mana dessa cor.' }),
    ],
  }],
  rulings: {
    1: 'teste: conta só as cinco cores (no máximo +5/+5 e cinco manas)',
    2: 'teste: sozinha, é 2/2 e produz {G}{W}',
  },
});
