// Abstract Performance
// Exile the top four cards of your library in a face-down pile, then exile the top four cards of your library in a
// face-up pile. An opponent chooses one of those piles. Put that pile into your graveyard. Look at the cards in the other
// pile. You may cast a spell from among them without paying its mana cost. Put the rest into your hand.
import { chooseItems, defineCard, exile, isLand, mayCastFree, moveObjects, nameOf, playerItem } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Abstract Performance',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const topo = (n: number) => s.zones.library[c.you].slice(0, n);
        // ruling 5: com menos cartas, a segunda pilha fica menor (ou vazia)
        const fechada = (yield* exile(c.g, topo(4), { faceDown: true })).filter((x): x is ObjId => x !== null && x !== undefined);
        const aberta = (yield* exile(c.g, topo(4))).filter((x): x is ObjId => x !== null && x !== undefined);
        // ruling 6: você escolhe o oponente na resolução
        const ops = c.g.opponents(c.you);
        if (!ops.length) return;
        const [op] = ops.length === 1 ? [String(ops[0])] : yield* chooseItems(c.g, c.you, 'Abstract Performance: escolha o oponente que escolhe a pilha', ops.map((p) => playerItem(c.g, p)), 1, 1);
        // ruling 4: o oponente não vê a pilha virada para baixo
        const [pilha] = yield* chooseItems(c.g, Number(op), 'Abstract Performance: escolha a pilha que vai para o cemitério', [
          { id: 'fechada', label: `Pilha virada para baixo (${fechada.length} cartas)` },
          { id: 'aberta', label: `Pilha virada para cima: ${aberta.map((id) => nameOf(c.g, id)).join(', ') || 'vazia'}` },
        ], 1, 1);
        const vai = pilha === 'fechada' ? fechada : aberta;
        const fica = pilha === 'fechada' ? aberta : fechada;
        if (vai.length) yield* moveObjects(c.g, vai.filter((id) => s.objects[id]?.zone === 'exile').map((id) => ({ id, to: 'graveyard' as const })), 'effect');
        for (const id of fica) if (s.objects[id]) s.objects[id].faceDown = false;
        c.g.bump();
        // rulings 1-3: uma mágica sem pagar (X = 0), durante a resolução, ignorando o tempo
        const magicas = fica.filter((id) => s.objects[id]?.zone === 'exile' && !isLand(c.g, id));
        if (magicas.length) {
          const [esc] = yield* chooseItems(c.g, c.you, 'Abstract Performance: escolha uma mágica para conjurar sem pagar (ou nenhuma)', [{ id: '', label: 'Nenhuma' }, ...magicas.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } }))], 1, 1);
          if (esc) yield* mayCastFree(c.g, c.you, Number(esc), `Conjurar ${nameOf(c.g, Number(esc))} sem pagar o custo de mana?`);
        }
        const resto = fica.filter((id) => s.objects[id]?.zone === 'exile');
        if (resto.length) yield* moveObjects(c.g, resto.map((id) => ({ id, to: 'hand' as const })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 107.3b — X vale 0',
    2: 'regra geral: CR 118.9a — sem custo alternativo; custos adicionais podem ser pagos',
    3: 'regra geral: CR 608.2g — conjura durante a resolução, ignorando o tempo',
    4: 'teste: o oponente escolhe sem ver a pilha virada para baixo',
    5: 'regra geral: com menos de oito cartas, a segunda pilha fica menor',
    6: 'regra geral: você escolhe o oponente na resolução',
  },
});
