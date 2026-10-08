// Summon: Esper Valigarmanda
// (As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)
// I — Exile an instant or sorcery card from each graveyard.
// II, III, IV — Add {R} for each lore counter on this Saga. You may cast an instant or sorcery card exiled with this
// Saga, and mana of any type can be spent to cast that spell.
// Flying, haste
import { addMana, chapter, chooseItems, defineCard, exile, is, keywords, lkiObj, mayCastDuringResolution, nameOf, sagaEnters } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const CHAVE = 'valigarmanda';

export default defineCard({
  name: 'Summon: Esper Valigarmanda',
  faces: [{
    abilities: [
      // ruling 5: ao entrar e na primeira fase principal, sem usar a pilha (motor/turn.ts)
      sagaEnters(),
      chapter([1], function* (c) {
        const s = c.g.state;
        for (const p of c.g.apnap()) {
          const cands = s.zones.graveyard[p].filter((id) => is.instantOrSorcery(c, id));
          if (!cands.length) continue;
          const [id] = cands.length === 1 ? [String(cands[0])] : yield* chooseItems(c.g, c.you, `Esper Valigarmanda: escolha uma instantânea ou feitiço do cemitério de ${s.players[p].name}`, cands.map((x) => ({ id: String(x), label: nameOf(c.g, x), obj: x, card: { def: s.objects[x].def } })), 1, 1);
          // ruling 4: o capítulo já disparado resolve mesmo que a Saga saia; o vínculo fica com a última informação
          if (s.objects[c.source]) yield* exile(c.g, [Number(id)], { linkTo: { obj: c.source, key: CHAVE } });
          else yield* exile(c.g, [Number(id)]);
        }
      }, { text: 'I — Exile uma carta de instantânea ou feitiço de cada cemitério.' }),
      // ruling 8: não são habilidades de mana; usam a pilha
      chapter([2, 3, 4], function* (c) {
        const s = c.g.state;
        const o = lkiObj(c.g, c.source);
        const n = o?.counters.lore ?? 0;
        if (n > 0) addMana(c.g, c.you, Array(n).fill('R'), { source: c.source });
        const cands = (o?.linked[CHAVE] ?? []).filter((id: ObjId) => s.objects[id]?.zone === 'exile');
        if (!cands.length) return;
        // ruling 10: conjura durante a resolução, pagando o custo com mana de qualquer tipo
        const [id] = cands.length === 1 ? [String(cands[0])] : yield* chooseItems(c.g, c.you, 'Esper Valigarmanda: escolha a carta exilada para conjurar (ou nenhuma)', [{ id: '', label: 'Nenhuma' }, ...cands.map((x: ObjId) => ({ id: String(x), label: nameOf(c.g, x), obj: x, card: { def: s.objects[x].def } }))], 1, 1);
        if (id) yield* mayCastDuringResolution(c.g, c.you, Number(id), { anyType: true, prompt: `Conjurar ${nameOf(c.g, Number(id))} (mana de qualquer tipo)?` });
      }, { text: 'II, III, IV — Adicione {R} para cada marcador de conhecimento nesta Saga. Você pode conjurar uma carta de instantânea ou feitiço exilada com esta Saga, e mana de qualquer tipo pode ser gasta nela.' }),
      ...keywords('flying', 'haste'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 714.2c — remover marcadores não dispara capítulos anteriores',
    2: 'regra geral: CR 714.2 — capítulo dispara ao atingir o número (motor/mecanicas.ts)',
    3: 'teste: o terceiro marcador dispara só o capítulo III',
    4: 'regra geral: CR 603.2 — o capítulo disparado não depende mais da Saga',
    5: 'regra geral: CR 714.3a-b — marcadores ao entrar e na primeira fase principal (motor/turn.ts)',
    6: 'regra geral: CR 603.3b — capítulos juntos: o controlador ordena',
    7: 'teste: com o último capítulo resolvido, a Saga é sacrificada',
    8: 'regra geral: CR 605.1a — os capítulos usam a pilha',
    9: 'regra geral: CR 714.1 — voar e ímpeto valem com qualquer número de marcadores',
    10: 'teste: conjura a carta exilada durante a resolução com a mana vermelha',
    11: 'regra geral: CR 714.4 — sem habilidades de capítulo, não é sacrificada (motor/sba.ts)',
  },
});
