// Maskwood Nexus
// Creatures you control are every creature type. The same is true for creature spells you control and creature cards you
// own that aren't on the battlefield.
// {3}, {T}: Create a 2/2 blue Shapeshifter creature token with changeling. (It is every creature type.)
import { activated, allCreatureTypes, controllerOf, createTokens, defineCard, isCreature, printedChars } from '../../motor/api.ts';
import type { StaticDef } from '../../motor/defs.ts';

// no campo: as criaturas que você controla; fora dele: as cartas de criatura de que você é dono e as mágicas de criatura
// que você controla (o tipo impresso decide fora do campo)
const todosOsTipos: StaticDef = {
  kind: 'static',
  offField: true,
  text: 'As criaturas que você controla são de todos os tipos de criatura. O mesmo vale para as mágicas de criatura que você controla e as cartas de criatura de que você é dono que não estão no campo de batalha.',
  affects: (c, o) => {
    if (o.zone === 'battlefield') return controllerOf(c.g, o.id) === c.you && isCreature(c.g, o.id);
    const dono = o.zone === 'stack' ? (o.stack?.controller ?? o.controller) : o.owner;
    if (dono !== c.you || !o.def) return false;
    return printedChars(o.copyOf?.def ?? o.def, o.copyOf?.face ?? o.face, o.owner).types.includes('Creature');
  },
  mods: () => [{ k: 'addTypes', subtypes: allCreatureTypes() }],
};

export default defineCard({
  name: 'Maskwood Nexus',
  faces: [{
    abilities: [
      todosOsTipos,
      // ruling 2: a ficha tem polimorfo e continua de todos os tipos se Maskwood Nexus sair
      activated('{3}, {T}', function* (c) { yield* createTokens(c.g, c.you, 'Shapeshifter 2/2', 1); }, {
        text: '{3}, {T}: Crie uma ficha de criatura Shapeshifter 2/2 azul com polimorfo.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 614.12 — os "ao entrar" que olham o tipo da criatura já veem todos os tipos (o efeito vale fora do campo)',
    2: 'teste: {3}, {T}: cria um Shapeshifter 2/2 azul com polimorfo',
    3: 'regra geral: CR 702.73a — polimorfo vale em todas as zonas (motor/criaturas.ts changeling)',
    4: 'regra geral: CR 702.73a — a carta com polimorfo é de todos os tipos de criatura (motor/criaturas.ts changeling)',
    5: 'regra geral: CR 613.1d — um efeito que troca o tipo de criatura passa por cima do polimorfo, que vem antes na camada 4',
    6: 'regra geral: CR 613.1d — perder as habilidades (camada 6) não desfaz os tipos dados na camada 4',
  },
});
