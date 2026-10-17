// Void Attendant
// Devoid (This card has no color.)
// {1}{G}, Put a card an opponent owns from exile into that player's graveyard: Create a 1/1 colorless Eldrazi Scion
// creature token. It has "Sacrifice this token: Add {C}."
import { activated, chooseItems, createTokens, defineCard, keyword, moveObjects, nameOf } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import { int } from '../../motor/rng.ts';
import type { ObjId } from '../../motor/types.ts';

/** cartas no exílio de que um oponente é dono */
function exiladasDeOponentes(c: SCtx): ObjId[] {
  return c.g.state.zones.exile.filter((id) => { const o = c.g.state.objects[id]; return !!o && !o.isToken && c.g.isOpponent(c.you, o.owner); });
}

export default defineCard({
  name: 'Void Attendant',
  faces: [{
    abilities: [
      // devoid: a cor vem dos dados (CR 702.114a, motor/oracle.ts)
      keyword('devoid'),
      activated([
        { k: 'mana', cost: '{1}{G}' },
        {
          k: 'custom', label: 'ponha no cemitério do dono uma carta exilada de que um oponente é dono',
          canPay: (c) => exiladasDeOponentes(c).length > 0,
          *pay(c) {
            const s = c.g.state;
            const todas = exiladasDeOponentes(c);
            if (!todas.length) return false;
            // ruling 9: as viradas para baixo não podem ser olhadas, a menos que um efeito deixe (as que você roubou com
            // Gonti, Siphon Insight…: essas você escolhe pelo nome); ruling 10: das outras, escolhe-se o grupo e a carta
            // sai ao acaso (simplificação: o grupo é o das viradas para baixo de cada dono que você não pode olhar)
            const podeOlhar = (id: ObjId) => { const v = s.objects[id].visibleTo; return Array.isArray(v) ? v.includes(c.you) : v === 'all'; };
            const abertas = todas.filter((id) => !s.objects[id].faceDown || podeOlhar(id));
            const donosViradas = [...new Set(todas.filter((id) => s.objects[id].faceDown && !podeOlhar(id)).map((id) => s.objects[id].owner))];
            const itens = [
              ...abertas.map((id) => ({ id: String(id), label: `${nameOf(c.g, id)} (de ${s.players[s.objects[id].owner].name}${s.objects[id].faceDown ? ', virada para baixo' : ''})`, obj: id, card: { def: s.objects[id].def } })),
              ...donosViradas.map((p) => ({ id: `v${p}`, label: `Uma carta virada para baixo de ${s.players[p].name} (ao acaso)` })),
            ];
            const [esc] = yield* chooseItems(c.g, c.you, 'Void Attendant: escolha a carta exilada que vai para o cemitério do dono', itens, 1, 1);
            let carta: ObjId;
            if (esc.startsWith('v')) {
              const dono = Number(esc.slice(1));
              const viradas = todas.filter((id) => s.objects[id].faceDown && !podeOlhar(id) && s.objects[id].owner === dono);
              carta = viradas[int(s.rng, viradas.length)];
            } else carta = Number(esc);
            yield* moveObjects(c.g, [{ id: carta, to: 'graveyard' }], 'cost', c.you);
            return { processada: carta };
          },
        },
      ], function* (c) {
        yield* createTokens(c.g, c.you, 'Eldrazi Scion', 1);
      }, { text: '{1}{G}, Coloque no cemitério do dono uma carta exilada de que um oponente é dono: Crie uma ficha de criatura Eldrazi Scion 1/1 incolor com "Sacrifique esta ficha: Adicione {C}".' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 602.2b — os custos são pagos ao ativar; ninguém responde no meio (motor/costs.ts payParts)',
    2: 'não se aplica: moldura da carta',
    3: 'regra geral: CR 702.114a — devoid é definida nos dados como incolor (motor/oracle.ts)',
    4: 'regra geral: CR 702.114a, 105.3 — uma cor dada por efeito substitui a incolor (motor/chars.ts)',
    5: 'regra geral: CR 702.114a — devoid funciona em todas as zonas (motor/oracle.ts)',
    6: 'regra geral: CR 613.1e — a cor é definida antes de perder a habilidade',
    7: 'não se aplica: o custo pede uma carta só',
    8: 'não se aplica: nenhuma carta dos decks exila o que iria para o cemitério',
    9: 'teste: uma carta virada para baixo que você pode olhar (roubada por Gonti) é escolhida pelo nome',
    10: 'teste: uma carta virada para baixo é escolhida pelo dono, ao acaso, sem ser olhada (o grupo é o de cada dono: simplificação)',
    11: 'regra geral: ficha Eldrazi Scion 1/1 (cartas/fichas.test.ts)',
    12: 'regra geral: subtipos Eldrazi e Scion (cartas/fichas.test.ts)',
    13: 'regra geral: CR 605.1a — sacrificar a ficha para adicionar {C} é habilidade de mana (cartas/fichas.test.ts)',
    14: 'não se aplica: Void Attendant não tem alvos',
  },
});
