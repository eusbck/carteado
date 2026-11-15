// Terrenos Verge: uma cor incondicional e outra se você controlar um dos tipos de terreno indicados.
import { controlledBy, isSubtype, mana, type Color, type ManaAbilityDef } from '../motor/api.ts';

/** CR 605.1a: a condição restringe a ativação da segunda habilidade de mana. */
export function manaDeVerge(principal: Color, condicional: Color, tipos: readonly [string, string], requisito: string): ManaAbilityDef[] {
  return [
    mana(principal, { text: `{T}: Adicione {${principal}}.` }),
    mana(condicional, {
      condition: (c) => controlledBy(c.g, c.you, (id) => tipos.some((tipo) => isSubtype(c.g, id, tipo))).length > 0,
      text: `{T}: Adicione {${condicional}}. Ative apenas se você controlar ${requisito}.`,
    }),
  ];
}
