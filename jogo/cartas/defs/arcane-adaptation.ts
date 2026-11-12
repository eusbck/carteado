// Arcane Adaptation
// As this enchantment enters, choose a creature type.
// Creatures you control are the chosen type in addition to their other types. The same is true for creature spells you
// control and creature cards you own that aren't on the battlefield.
import { asEnters, chooseCreatureType, controllerOf, defineCard, isCreature, printedChars } from '../../motor/api.ts';
import type { StaticDef } from '../../motor/defs.ts';

// no campo: as criaturas que você controla; fora dele: as cartas de criatura de que você é dono e as mágicas de criatura
// que você controla (o tipo impresso decide fora do campo), como Maskwood Nexus
const tipoEscolhido: StaticDef = {
  kind: 'static',
  offField: true,
  text: 'As criaturas que você controla são do tipo escolhido, além dos outros tipos delas. O mesmo vale para as mágicas de criatura que você controla e as cartas de criatura de que você é dono que não estão no campo de batalha.',
  affects: (c, o) => {
    if (!c.g.state.objects[c.source]?.choices.creatureType) return false;
    if (o.zone === 'battlefield') return controllerOf(c.g, o.id) === c.you && isCreature(c.g, o.id);
    const dono = o.zone === 'stack' ? (o.stack?.controller ?? o.controller) : o.owner;
    if (dono !== c.you || !o.def) return false;
    return printedChars(o.copyOf?.def ?? o.def, o.copyOf?.face ?? o.face, o.owner).types.includes('Creature');
  },
  mods: (c) => [{ k: 'addTypes', subtypes: [c.g.state.objects[c.source].choices.creatureType as string] }],
};

export default defineCard({
  name: 'Arcane Adaptation',
  faces: [{
    abilities: [
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, c.you, 'Arcane Adaptation: escolha um tipo de criatura');
      }, 'Ao entrar, escolha um tipo de criatura.'),
      tipoEscolhido,
    ],
  }],
  rulings: {
    1: 'regra geral: CR 205.3m — só um tipo de criatura existente é oferecido (motor/efeitos.ts chooseCreatureType)',
    2: 'regra geral: CR 614.12 — as substituições de entrar olham a criatura já com o tipo escolhido (o efeito vale fora do campo)',
  },
});
