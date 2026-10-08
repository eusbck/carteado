// Espers to Magicite
// Exile each opponent's graveyard. When you do, choose up to one target creature card exiled this way. Create a token
// that's a copy of that card, except it's an artifact and it loses all other card types.
import { createTokens, defineAbility, defineCard, exile, is, reflexive, t, tgt, triggered, upTo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const COPIA = defineAbility('Espers to Magicite:copia', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const id = tgt(c);
  if (id === null) return;
  const def = c.g.state.objects[id].def;
  // rulings 1, 3-5: valores copiáveis da carta, como artefato e sem os outros tipos (X = 0)
  yield* createTokens(c.g, c.you, { copyOf: { def, face: 0, except: { setTypes: ['Artifact'] } } }, 1);
}, {
  // ruling 2: alvo escolhido quando o gatilho reflexivo vai para a pilha, só entre as cartas exiladas por esta mágica
  targets: [upTo(1, t.card('exile', (c, id) => is.creature(c, id) && ((c.event?.exiladas as ObjId[] | undefined) ?? []).includes(id), 'até uma carta de criatura alvo exilada assim', 'any'))],
  text: 'Quando fizer isso, escolha até uma carta de criatura alvo exilada assim. Crie uma ficha que é cópia dela, exceto que é um artefato e perde os outros tipos de card.',
}));

export default defineCard({
  name: 'Espers to Magicite',
  faces: [{
    spell: {
      *effect(c) {
        const ids = c.g.opponents(c.you).flatMap((p) => [...c.g.state.zones.graveyard[p]]);
        const res = ids.length ? yield* exile(c.g, ids) : [];
        const exiladas = res.filter((x): x is ObjId => x !== null && x !== undefined);
        // CR 603.12: "quando fizer isso" — gatilho reflexivo
        reflexive(c, COPIA.id!, {}, { exiladas });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 707.9 — X vale 0',
    2: 'teste: o alvo é escolhido depois de exilar',
    3: 'regra geral: CR 707.5 — habilidades de entrar da cópia funcionam',
    4: 'teste: a ficha é só artefato',
    5: 'regra geral: CR 707.2 — copia a carta impressa',
  },
});
