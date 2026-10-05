// Renegade Bull
// Trample
// Whenever you cast an instant or sorcery spell, this creature gets +X/+0 until end of turn, where X is that spell's mana
// value.
// Whenever this creature attacks, exile up to one target instant or sorcery card from your graveyard and copy it. You may
// cast the copy without paying its mana cost.
import { createObject, defineCard, exile, is, keyword, lkiChars, mayCastFree, on, t, tgt, triggered, untilEndOfTurn, upTo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Renegade Bull',
  faces: [{
    abilities: [
      keyword('trample'),
      // rulings 1, 2, 7: resolve antes da mágica; valor de mana (com o X escolhido)
      triggered(on.youCast(is.instantOrSorcery), function* (c) {
        const x = lkiChars(c.g, c.event.spell as ObjId)?.manaValue ?? 0;
        if (x > 0 && c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p: x, t: 0 }]);
      }, { text: 'Sempre que você conjura uma mágica instantânea ou de feitiço, esta criatura recebe +X/+0 até o fim do turno, onde X é o valor de mana dela.' }),
      triggered(on.selfAttacks(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const [ex] = yield* exile(c.g, [id]);
        if (ex === null || ex === undefined) return;
        const o = c.g.state.objects[ex];
        // CR 707.12: cópia da carta, conjurada durante a resolução; rulings 3-6: sem pagar (X = 0), ignorando o tempo
        const copia = createObject(c.g, { def: o.def, owner: c.you, controller: c.you, zone: 'exile', isCopy: true, copyOf: { def: o.def, face: 0 } });
        yield* mayCastFree(c.g, c.you, copia.id, `Conjurar a cópia de ${o.def} sem pagar o custo de mana?`);
        // ruling 5: sem conjurar, a cópia deixa de existir nas ações de estado (CR 704.5e)
      }, {
        targets: [upTo(1, t.card('graveyard', is.instantOrSorcery, 'até uma carta de instantânea ou feitiço alvo no seu cemitério'))],
        text: 'Sempre que esta criatura ataca, exile até uma carta de instantânea ou feitiço alvo do seu cemitério e copie-a. Você pode conjurar a cópia sem pagar o custo de mana.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.3 — o gatilho resolve antes da mágica',
    2: 'regra geral: CR 202.3 — custos alternativos e reduções não mudam o valor de mana',
    3: 'regra geral: CR 118.9a — sem custo alternativo; custos adicionais podem ser pagos',
    4: 'teste: conjura a cópia durante a resolução',
    5: 'regra geral: CR 704.5e — a cópia não conjurada deixa de existir',
    6: 'regra geral: CR 107.3b — sem pagar, X é 0',
    7: 'regra geral: CR 202.3e — na pilha, X usa o valor escolhido',
  },
});
