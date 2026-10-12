// Urza's Saga
// (As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)
// I — This Saga gains "{T}: Add {C}."
// II — This Saga gains "{2}, {T}: Create a 0/0 colorless Construct artifact creature token with 'This token gets +1/+1 for
// each artifact you control.'"
// III — Search your library for an artifact card with mana cost {0} or {1}, put it onto the battlefield, then shuffle.
import { activated, addEffect, chapter, chars, createTokens, defineAbility, defineCard, mana, sagaEnters, searchTo } from '../../motor/api.ts';
import type { Ctx } from '../../motor/defs.ts';

const MANA = defineAbility("Urza's Saga:mana", mana('C', { text: '{T}: Adicione {C}.' }));
const CONSTRUCT = defineAbility("Urza's Saga:construct", activated('{2}, {T}', function* (c) { yield* createTokens(c.g, c.you, 'Construct (artefatos)', 1); }, {
  text: '{2}, {T}: Crie uma ficha de criatura artefato Construct 0/0 incolor com "Esta ficha recebe +1/+1 para cada artefato que você controla."',
}));

// ruling 2: a Saga fica com a habilidade enquanto estiver no campo
function ganha(c: Ctx, id: string): void {
  if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
  addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: c.source }, affected: [c.source], mods: [{ k: 'addAbility', id }] });
}

export default defineCard({
  name: "Urza's Saga",
  faces: [{
    abilities: [
      sagaEnters(),
      chapter([1], function* (c) { ganha(c, MANA.id!); }, { text: 'I — Esta Saga ganha "{T}: Adicione {C}."' }),
      chapter([2], function* (c) { ganha(c, CONSTRUCT.id!); }, { text: 'II — Esta Saga ganha "{2}, {T}: Crie uma ficha de criatura artefato Construct 0/0 incolor com \'Esta ficha recebe +1/+1 para cada artefato que você controla.\'"' }),
      chapter([3], function* (c) {
        // ruling 3: custo de mana {0} ou {1} de verdade, não valor de mana 0 ou 1 (carta sem custo, {U} e {X} não servem)
        yield* searchTo(c, c.you, (id) => {
          const ch = chars(c.g, id);
          const custo = ch.manaCost;
          return ch.types.includes('Artifact') && !!custo && custo.length === 1 && custo[0].k === 'generic' && (custo[0].n === 0 || custo[0].n === 1);
        }, 1, 'battlefield', { prompt: 'Procure uma carta de artefato com custo de mana {0} ou {1}' });
      }, { text: 'III — Procure no seu grimório uma carta de artefato com custo de mana {0} ou {1}, coloque-a no campo de batalha e depois embaralhe.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 305.1 — é terreno: só pode ser jogada como terreno, nunca conjurada (motor/priority.ts)',
    2: 'teste: os capítulos I e II dão habilidades que ficam; o III busca um artefato de custo {0} ou {1}',
    3: 'teste: os capítulos I e II dão habilidades que ficam; o III busca um artefato de custo {0} ou {1}',
    4: 'regra geral: CR 714.4 — mesmo sendo terreno, é Saga e é sacrificada depois do último capítulo (motor/sba.ts)',
    5: "não se aplica: nenhum Urza's Tower, Mine ou Power Plant nos decks desta mesa",
  },
});