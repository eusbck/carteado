// Cavern of Souls
// As this land enters, choose a creature type.
// {T}: Add {C}.
// {T}: Add one mana of any color. Spend this mana only to cast a creature spell of the chosen type, and that spell can't
// be countered.
import { asEnters, chars, chooseCreatureType, defineCard, defineFn, isCreature, mana, spellCantBeCountered, type G } from '../../motor/api.ts';
import type { ManaUnit } from '../../motor/types.ts';

const tipoDa = (g: G, fonte: number | null | undefined): string | undefined => {
  if (fonte === null || fonte === undefined) return undefined;
  const o = g.state.objects[fonte] ?? g.state.lki[fonte]?.obj;
  return o?.choices.tipo as string | undefined;
};

// CR 106.6: só para conjurar mágica de criatura do tipo escolhido
const SO_DO_TIPO = 'Cavern of Souls:soDoTipo';
defineFn(SO_DO_TIPO, (g: G, purpose: { kind: string; obj?: number }, u: ManaUnit) => {
  const tipo = tipoDa(g, u.source);
  return purpose.kind === 'spell' && purpose.obj !== undefined && !!tipo && isCreature(g, purpose.obj) && chars(g, purpose.obj).subtypes.includes(tipo);
});
// ruling 2/4: gasta em qualquer parte do custo, a mágica não pode ser anulada
const NAO_ANULA = 'Cavern of Souls:naoAnula';
defineFn(NAO_ANULA, (g: G, _u: ManaUnit, purpose: { kind: string; obj?: number }) => { if (purpose.kind === 'spell' && purpose.obj !== undefined) spellCantBeCountered(g, purpose.obj); });

export default defineCard({
  name: 'Cavern of Souls',
  faces: [{
    abilities: [
      asEnters(function* (c, ev) { ev.choices.tipo = yield* chooseCreatureType(c.g, c.you, 'Cavern of Souls: escolha um tipo de criatura'); }, 'Conforme este terreno entra, escolha um tipo de criatura.'),
      mana('C'),
      mana('any', { restriction: SO_DO_TIPO, rider: NAO_ANULA, text: '{T}: Adicione uma mana de qualquer cor. Gaste essa mana só para conjurar uma mágica de criatura do tipo escolhido, e essa mágica não pode ser anulada.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 205.3m — só tipos de criatura são oferecidos (motor/efeitos.ts chooseCreatureType)',
    2: 'teste: gasta numa mágica de criatura do tipo escolhido, ela não pode ser anulada; em outra mágica, não pode ser gasta',
    3: 'regra geral: CR 205.3m — só tipos de criatura são oferecidos (motor/efeitos.ts chooseCreatureType)',
    4: 'teste: gasta numa mágica de criatura do tipo escolhido, ela não pode ser anulada; em outra mágica, não pode ser gasta',
  },
});
