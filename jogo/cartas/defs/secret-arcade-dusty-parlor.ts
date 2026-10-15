// Secret Arcade // Dusty Parlor (Sala: carta dividida com linha de tipo compartilhada, CR 709.5)
// Secret Arcade {4}{W} — Enchantment — Room
// Nonland permanents you control and permanent spells you control are enchantments in addition to their other types.
// Dusty Parlor {2}{W} — Enchantment — Room
// Whenever you cast an enchantment spell, put a number of +1/+1 counters equal to that spell's mana value on up to one
// target creature.
// (You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked
// door to unlock it.)
import { addCounters, chars, controllerOf, defineCard, is, lkiChars, on, printedChars, staticAbility, t, tgt, triggered, upTo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { SALA } from '../milagres.ts';

const PERMANENTES = ['Artifact', 'Battle', 'Creature', 'Enchantment', 'Land', 'Planeswalker'];

export default defineCard({
  name: 'Secret Arcade // Dusty Parlor',
  faces: [
    {
      abilities: [
        // no campo: as permanentes não terreno que você controla; na pilha: as mágicas de permanente que você controla
        // (fora do campo, `affects` olha a face impressa da mágica)
        staticAbility({
          offField: true,
          affects: (c, o) => {
            if (o.zone === 'battlefield') return controllerOf(c.g, o.id) === c.you && !chars(c.g, o.id).types.includes('Land');
            if (o.zone !== 'stack' || o.stack?.kind !== 'spell' || o.stack.controller !== c.you || o.faceDown) return false;
            return printedChars(o.def, o.face ?? 0, o.owner).types.some((x) => PERMANENTES.includes(x));
          },
          mods: () => [{ k: 'addTypes', types: ['Enchantment'] }],
          text: 'As permanentes não terreno que você controla e as mágicas de permanente que você controla são encantamentos além dos outros tipos.',
        }),
      ],
    },
    {
      abilities: [
        triggered(on.youCast(is.enchantment), function* (c) {
          const id = tgt(c);
          const magica = (c.event as { spell?: ObjId }).spell;
          // valor de mana da mágica (com o X escolhido), como existiu por último na pilha
          const mv = magica === undefined ? 0 : (c.g.state.objects[magica]?.zone === 'stack' ? chars(c.g, magica).manaValue : lkiChars(c.g, magica)?.manaValue ?? 0);
          if (id !== null && mv > 0) addCounters(c.g, { kind: 'obj', id }, '+1/+1', mv, c.you);
        }, {
          targets: [upTo(1, t.creature())],
          text: 'Sempre que você conjura uma mágica de encantamento, coloque marcadores +1/+1 iguais ao valor de mana dessa mágica em até uma criatura alvo.',
        }),
      ],
    },
  ],
  rulings: {
    1: 'não se aplica: fala de Séance Board, que não está nos decks',
    2: 'teste: Dusty Parlor: conjurar um encantamento põe marcadores iguais ao valor de mana dele',
    3: SALA.conjurarUmaPorta,
    4: SALA.portaNaoConjurada,
    5: SALA.cartaSo,
    6: SALA.doisNomes,
    7: SALA.caracteristicasDaPorta,
    8: SALA.foraDaPilha,
    9: SALA.noCampo,
    10: SALA.copia,
    11: SALA.vindaDeFora,
    12: SALA.semPorta,
    13: SALA.destrancar,
    14: 'não se aplica: nenhuma porta desta Sala tem gatilho de destrancar',
    15: SALA.mandaDestrancar,
    16: SALA.mandaTrancar,
    17: 'não se aplica: nenhuma porta desta Sala tem gatilho de destrancar',
    18: SALA.totalmente,
  },
});
