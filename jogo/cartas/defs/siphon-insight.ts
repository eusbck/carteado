// Siphon Insight
// Look at the top two cards of target opponent's library. Exile one of them face down and put the other on the bottom
// of that library. You may play the exiled card for as long as it remains exiled, and you may spend mana as though it
// were mana of any color to cast that spell.
// Flashback {1}{U}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { allowPlay, chooseItems, defineCard, flashback, moveObjects, nameOf, t, tgtPlayer } from '../../motor/api.ts';
import { ROUBO } from '../roubo.ts';

export default defineCard({
  name: 'Siphon Insight',
  faces: [{
    altCosts: [flashback('{1}{U}{B}')],
    spell: {
      targets: [t.opponent()],
      *effect(c) {
        const s = c.g.state;
        const p = tgtPlayer(c);
        if (p === null) return;
        const topo = s.zones.library[p].slice(0, 2);
        if (!topo.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, `Siphon Insight: escolha a carta de ${s.players[p].name} para exilar virada para baixo (a outra vai para o fundo do grimório)`,
          topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } })), 1, 1);
        const escolhida = Number(esc);
        // ruling 7: só você pode olhar a carta exilada (CR 406.3)
        const [ex] = yield* moveObjects(c.g, [{ id: escolhida, to: 'exile', faceDown: true, visibleTo: [c.you] }], 'exile');
        const outra = topo.find((id) => id !== escolhida && s.objects[id]?.zone === 'library');
        if (outra !== undefined) {
          s.zones.library[p] = [...s.zones.library[p].filter((id) => id !== outra), outra];
          c.g.bump();
        }
        if (ex === null || ex === undefined || s.objects[ex]?.zone !== 'exile') return;
        // ruling 8: pode jogar mesmo se for terreno; "qualquer cor": o motor usa a permissão de qualquer tipo
        allowPlay(c.g, c.you, c.source, [ex], { kind: 'permanent' }, { anyType: true });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.34a — a retrospectiva vale para qualquer carta no cemitério, conjurada ou não (motor/priority.ts)',
    2: 'regra geral: CR 702.34a, 117.1 — com prioridade, a carta no cemitério pode ser conjurada pela retrospectiva (motor/priority.ts)',
    3: 'teste: pela retrospectiva, a carta é exilada depois de resolver',
    4: 'regra geral: CR 702.34a — conjurada pela retrospectiva, é exilada ao sair da pilha de qualquer jeito (motor/actions.ts exileOnLeave)',
    5: 'regra geral: CR 601.2f — o custo total parte do custo de retrospectiva (motor/stack.ts totalSpellCost)',
    6: 'regra geral: CR 702.34a — a retrospectiva segue o tempo da carta: instantânea, a qualquer momento (motor/priority.ts)',
    7: 'teste: exila uma das duas virada para baixo (só você vê) e põe a outra no fundo',
    8: 'teste: um terreno exilado assim pode ser jogado',
    9: ROUBO.tempo,
    10: 'regra geral: CR 406.3 — a carta exilada fica virada para baixo e só você pode olhá-la',
  },
});
