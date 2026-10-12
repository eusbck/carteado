// Biotransference
// Creatures you control are artifacts in addition to their other types. The same is true for creature spells you control
// and creature cards you own that aren't on the battlefield.
// Whenever you cast an artifact spell, you lose 1 life and create a 2/2 black Necron Warrior artifact creature token.
import { controllerOf, defineCard, isCreature, isType, loseLife, on, printedChars, triggered } from '../../motor/api.ts';
import type { StaticDef } from '../../motor/defs.ts';
import { criaNecronWarriors } from '../necrons.ts';

// no campo: as criaturas que você controla; fora dele: as cartas de criatura de que você é dono e as mágicas de criatura
// que você controla (o tipo impresso decide fora do campo)
const artefatos: StaticDef = {
  kind: 'static',
  offField: true,
  text: 'As criaturas que você controla são artefatos além dos outros tipos delas. O mesmo vale para as mágicas de criatura que você controla e as cartas de criatura de que você é dono que não estão no campo de batalha.',
  affects: (c, o) => {
    if (o.zone === 'battlefield') return controllerOf(c.g, o.id) === c.you && isCreature(c.g, o.id);
    const dono = o.zone === 'stack' ? (o.stack?.controller ?? o.controller) : o.owner;
    if (dono !== c.you || !o.def) return false;
    return printedChars(o.copyOf?.def ?? o.def, o.copyOf?.face ?? o.face, o.owner).types.includes('Creature');
  },
  mods: () => [{ k: 'addTypes', types: ['Artifact'] }],
};

export default defineCard({
  name: 'Biotransference',
  faces: [{
    abilities: [
      artefatos,
      triggered(on.youCast((c, id) => isType(c.g, id, 'Artifact')), function* (c) {
        loseLife(c.g, c.you, 1, c.source);
        yield* criaNecronWarriors(c, 1);
      }, { text: 'Sempre que você conjura uma mágica de artefato, você perde 1 ponto de vida e cria uma ficha de criatura artefato Necron Warrior 2/2 preta.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 614.12 — as substituições de "artefatos entram…" olham a criatura já como artefato (motor/actions.ts putOntoBattlefield)' },
});