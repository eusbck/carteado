// Muddle, the Ever-Changing
// Whenever you cast an instant or sorcery spell, Muddle becomes a copy of up to one target nonlegendary creature you
// control until end of turn, except it has myriad.
import { and, copiableValues, defineCard, is, MYRIAD, not, on, t, tgt, triggered, untilEndOfTurn, upTo } from '../../motor/api.ts';

void MYRIAD; // garante o registro da miríade antes das cartas

export default defineCard({
  name: 'Muddle, the Ever-Changing',
  faces: [{
    abilities: [
      // ruling 6: resolve antes da mágica
      triggered(on.youCast(is.instantOrSorcery), function* (c) {
        const id = tgt(c);
        // ruling 10: alvo ilegal, nada acontece
        if (id === null || c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        // rulings 3, 11-12, 15: valores copiáveis, com miríade como exceção; não entra nem sai do campo
        const v = copiableValues(c.g, id);
        // a palavra-chave 'myriad' traz a habilidade registrada como 'kw:myriad' (motor/mecanicas.ts)
        const except = { ...(v.except ?? {}), addKeywords: [...(v.except?.addKeywords ?? []), 'myriad'] };
        untilEndOfTurn(c, [c.source], [{ k: 'copy', of: { ...v, except } }]);
      }, {
        targets: [upTo(1, t.creature(and(is.yours, not(is.legendary)), 'até uma criatura não lendária alvo que você controla'))],
        text: 'Sempre que você conjura uma mágica instantânea ou de feitiço, Muddle vira uma cópia de até uma criatura não lendária alvo que você controla até o fim do turno, exceto que tem miríade.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.5 — habilidades de entrar das fichas funcionam',
    2: 'regra geral: CR 707.2 — sem marcadores nem efeitos',
    3: 'regra geral: CR 707.2 — enquanto copia, não tem a própria habilidade',
    4: 'regra geral: CR 707.2 — ficha copia os valores originais da ficha',
    5: 'teste: com um só oponente, nenhuma ficha',
    6: 'regra geral: CR 603.3 — o gatilho resolve antes da mágica',
    7: 'regra geral: CR 702.116a — todas as fichas criadas são exiladas no fim do combate',
    8: 'regra geral: CR 506.3 — entram atacando sem terem sido declaradas',
    9: 'regra geral: CR 702.116a — as fichas entram juntas',
    10: 'regra geral: CR 608.2b — alvo ilegal, nada acontece',
    11: 'regra geral: CR 707.3 — copia o que a criatura estiver copiando',
    12: 'regra geral: CR 707.4 — virar cópia não é entrar no campo',
    13: 'regra geral: CR 506.2 — jogador defensor é o atacado',
    14: 'teste: cada ficha ataca um oponente diferente do defensor',
    15: 'regra geral: CR 707.9b — exceção: tem miríade',
  },
});
