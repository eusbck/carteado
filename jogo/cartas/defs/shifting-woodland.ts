// Shifting Woodland
// This land enters tapped unless you control a Forest.
// {T}: Add {G}.
// Delirium — {2}{G}{G}: This land becomes a copy of target permanent card in your graveyard until end of turn. Activate
// only if there are four or more card types among cards in your graveyard.
import { activated, becomeCopy, chars, defineCard, is, land, mana, t, tgt } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const TIPOS = ['Artifact', 'Battle', 'Creature', 'Enchantment', 'Instant', 'Kindred', 'Land', 'Planeswalker', 'Sorcery'];
const delirio = (c: SCtx) => new Set(c.g.state.zones.graveyard[c.you].flatMap((id) => chars(c.g, id).types.filter((x) => TIPOS.includes(x)))).size >= 4;

export default defineCard({
  name: 'Shifting Woodland',
  faces: [{
    abilities: [
      land.tappedUnlessControl('Forest'),
      mana('G'),
      activated('{2}{G}{G}', function* (c) {
        const id = tgt(c);
        if (id !== null && c.g.state.objects[c.source]?.zone === 'battlefield') becomeCopy(c, c.source, id, { duration: { kind: 'endOfTurn' } });
      }, {
        condition: delirio,
        targets: [t.card('graveyard', is.permanentCard, 'carta de permanente alvo do seu cemitério')],
        text: 'Delírio — {2}{G}{G}: Este terreno vira uma cópia da carta de permanente alvo do seu cemitério até o fim do turno. Ative só se houver quatro ou mais tipos de carta entre as cartas do seu cemitério.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.2 — copia os valores impressos da carta',
    2: 'regra geral: CR 707.4 — continua o mesmo objeto, virado ou não',
  },
});
