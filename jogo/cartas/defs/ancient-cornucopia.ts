// Ancient Cornucopia
// Whenever you cast a spell that's one or more colors, you may gain 1 life for each of that spell's colors. Do this only
// once each turn.
// {T}: Add one mana of any color.
import { defineCard, gainLife, lkiChars, mana, on, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const CHAVE = 'ancient-cornucopia';

export default defineCard({
  name: 'Ancient Cornucopia',
  faces: [{
    abilities: [
      triggered(on.youCast((c, id) => (lkiChars(c.g, id)?.colors.length ?? 0) > 0), function* (c) {
        const s = c.g.state;
        const o = s.objects[c.source];
        if (!o || o.zone !== 'battlefield' || o.usedThisTurn[CHAVE] === s.turn.number) return;
        // ruling 2: o número de cores da mágica; ruling 3: resolve antes dela, e usa a última informação se foi anulada
        const n = lkiChars(c.g, c.event.spell as ObjId)?.colors.length ?? 0;
        if (n <= 0 || !(yield* yesNo(c.g, c.you, `Ancient Cornucopia: ganhar ${n} de vida? (só uma vez por turno)`))) return;
        o.usedThisTurn[CHAVE] = s.turn.number;
        c.g.bump();
        gainLife(c.g, c.you, n, c.source);
      }, {
        // ruling 1: depois de ganhar vida assim, não dispara mais no turno
        condition: (c) => c.g.state.objects[c.source]?.usedThisTurn[CHAVE] !== c.g.state.turn.number,
        text: 'Sempre que você conjura uma mágica de uma ou mais cores, você pode ganhar 1 de vida para cada cor dessa mágica. Faça isso apenas uma vez por turno.',
      }),
      mana('any'),
    ],
  }],
  rulings: {
    1: 'teste: depois de ganhar vida assim, não dispara mais no turno',
    2: 'teste: conjurando uma mágica de três cores, você pode ganhar 3 de vida',
    3: 'regra geral: CR 608.2h — resolve antes da mágica; se ela foi anulada, vale a última informação conhecida (motor/dsl.ts lkiChars)',
  },
});