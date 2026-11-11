// Lieutenant Nyota Uhura
// Strange new worlds — {4}, {T}: Target opponent exiles the top X cards of their library, where X is the number of
// differently named lands you control. You may cast an instant or sorcery spell from among them without paying its
// mana cost. Then that player puts the rest on the bottom of their library in a random order.
import { activated, chooseItems, defineCard, exile, isType, mayCastFree, moveObjects, nameOf, t, tgtPlayer } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { ChoiceItem } from '../../motor/types.ts';
import { terrenosComNomesDiferentes } from '../startrek.ts';

export default defineCard({
  name: 'Lieutenant Nyota Uhura',
  faces: [{
    abilities: [
      activated('{4}, {T}', function* (c) {
        const op = tgtPlayer(c);
        if (op === null) return;
        const s = c.g.state;
        const x = terrenosComNomesDiferentes(c.g, c.you);
        const topo = s.zones.library[op].slice(0, x);
        if (!topo.length) return;
        const exiladas = (yield* exile(c.g, topo)).filter((id): id is number => id !== null);
        const serve = (id: number) => isType(c.g, id, 'Instant') || isType(c.g, id, 'Sorcery');
        const itens: ChoiceItem[] = exiladas.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def }, disabled: !serve(id) }));
        if (itens.some((i) => !i.disabled)) {
          const esc = yield* chooseItems(c.g, c.you, 'Lieutenant Uhura: você pode conjurar uma mágica instantânea ou feitiço dentre elas sem pagar o custo de mana', itens, 0, 1);
          if (esc.length) yield* mayCastFree(c.g, c.you, Number(esc[0]), `Conjurar ${nameOf(c.g, Number(esc[0]))} sem pagar o custo de mana?`);
        }
        // o resto vai para o fundo do grimório do dono, em ordem aleatória
        const resto = shuffle(s.rng, exiladas.filter((id) => c.g.state.objects[id]?.zone === 'exile'));
        if (resto.length) {
          const novos = yield* moveObjects(c.g, resto.map((id) => ({ id, to: 'library' as const })), 'effect');
          const ids = novos.filter((id): id is number => id !== null);
          s.zones.library[op] = [...s.zones.library[op].filter((id) => !ids.includes(id)), ...ids];
          c.g.bump();
        }
      }, {
        targets: [t.opponent('oponente alvo')],
        text: 'Strange new worlds — {4}, {T}: O oponente alvo exila as X cartas do topo do grimório dele, em que X é o número de terrenos com nomes diferentes que você controla. Você pode conjurar uma mágica instantânea ou feitiço dentre elas sem pagar o custo de mana. Depois, esse jogador coloca o resto no fundo do grimório em ordem aleatória.',
      }),
    ],
  }],
  rulings: {},
});
