// Soldevi Adnate
// {T}, Sacrifice a black or artifact creature: Add an amount of {B} equal to the sacrificed creature's mana value.
import { chars, defineCard, isCreature, mana, manaValue } from '../../motor/api.ts';
import type { ManaAbilityDef } from '../../motor/defs.ts';
import type { ManaType } from '../../motor/types.ts';

const serve = (g: Parameters<typeof chars>[0], id: number) => isCreature(g, id) && (chars(g, id).colors.includes('B') || chars(g, id).types.includes('Artifact'));

// a mana depende da criatura sacrificada: uma alternativa por valor de mana possível entre as que servem
const MANA: ManaAbilityDef = {
  ...mana((c) => {
    const vals = [...new Set(c.g.state.zones.battlefield.filter((id) => serve(c.g, id) && c.g.state.objects[id].controller === c.you).map((id) => manaValue(c.g, id)))];
    return vals.map((n) => Array<ManaType>(n).fill('B'));
  }, { text: '{T}, Sacrifique uma criatura preta ou de artefato: Adicione {B} igual ao valor de mana da criatura sacrificada.' }),
  cost: [{ k: 'tap' }, { k: 'sacrifice', n: 1, filter: (c, id) => serve(c.g, id), label: 'uma criatura preta ou de artefato' }],
};

export default defineCard({ name: 'Soldevi Adnate', faces: [{ abilities: [MANA] }], rulings: {} });
