// Soldevi Adnate
// {T}, Sacrifice a black or artifact creature: Add an amount of {B} equal to the sacrificed creature's mana value.
import { chars, controlledBy, defineCard, lkiChars, mana, manaValue } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import type { ManaType, ObjId } from '../../motor/types.ts';

const pretaOuArtefato = (c: SCtx, id: ObjId): boolean => {
  const ch = chars(c.g, id);
  return ch.types.includes('Creature') && (ch.colors.includes('B') || ch.types.includes('Artifact'));
};

const nB = (n: number): ManaType[] => Array<ManaType>(Math.max(0, n)).fill('B');

export default defineCard({
  name: 'Soldevi Adnate',
  faces: [{
    abilities: [{
      ...mana((c) => {
        // estimativa para o planejador: uma alternativa por valor de mana possível entre as que podem ser sacrificadas
        const vs = [...new Set(controlledBy(c.g, c.you, (id) => pretaOuArtefato(c, id)).map((id) => manaValue(c.g, id)))].filter((n) => n > 0);
        return vs.map(nB);
      }, { text: '{T}, Sacrifique uma criatura preta ou criatura artefato: Adicione {B} em quantidade igual ao valor de mana da criatura sacrificada.' }),
      cost: [{ k: 'tap' }, { k: 'sacrifice', n: 1, filter: pretaOuArtefato, label: 'uma criatura preta ou criatura artefato' }],
      // lote4-b (motor/costs.ts): a mana vem do valor de mana da sacrificada, pela última informação (CR 608.2h)
      produceFromCost: (c, info) => {
        const id = (info.sacrificed as ObjId[] | undefined)?.[0];
        return nB(id !== undefined ? lkiChars(c.g, id)?.manaValue ?? 0 : 0);
      },
    }],
  }],
  rulings: {},
});
