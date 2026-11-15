// Terrenos Verge: a segunda cor exige um dos tipos de terreno indicados (CR 305.6, 602.1b).
import { chars, controlledBy, mana, type Color, type ManaAbilityDef } from '../motor/api.ts';

export function manaDeVerge(cor: Color, ...tipos: string[]): ManaAbilityDef {
  return mana(cor, {
    condition: (c) => controlledBy(c.g, c.you, (id) => {
      const ch = chars(c.g, id);
      return ch.types.includes('Land') && tipos.some((tipo) => ch.subtypes.includes(tipo));
    }).length > 0,
    text: `{T}: Adicione {${cor}}. Ative somente se você controlar um terreno do tipo ${tipos.join(' ou ')}.`,
  });
}
