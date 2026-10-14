// Jace, Architect of Thought
// +1: Until your next turn, whenever a creature an opponent controls attacks, it gets -1/-0 until end of turn.
// −2: Reveal the top three cards of your library. An opponent separates those cards into two piles. Put one pile into
// your hand and the other on the bottom of your library in any order.
// −8: For each player, search that player's library for a nonland card and exile it, then that player shuffles. You may
// cast those cards without paying their mana costs.
import {
  activated, castSpell, chooseItems, controllerOf, defineAbility, defineCard, delayed, exile, isLand, moveObjects, nameOf,
  playerItem, searchLibrary, shuffleLibrary, triggered, untilEndOfTurn,
} from '../../motor/api.ts';
import type { ChoiceItem, ObjId, PlayerId } from '../../motor/types.ts';

/** o gatilho atrasado do +1: vale até o seu próximo turno começar (ruling 1: não importa quem a criatura ataca) */
const ENFRAQUECE = defineAbility('Jace, Architect of Thought:enfraquece', triggered({
  kind: 'event',
  match: (e, c) => {
    if (e.type !== 'attackers') return false;
    const d = (c as { delayed?: { createdTurn: number } }).delayed;
    const s = c.g.state;
    // "até o seu próximo turno": a partir do seu próximo turno, não dispara mais
    if (d && s.players[c.you].lastTurn > d.createdTurn) return false;
    const deles = e.attackers.filter((a) => c.g.isOpponent(c.you, controllerOf(c.g, a.obj))).map((a) => ({ atacante: a.obj }));
    return deles.length ? deles : false;
  },
}, function* (c) {
  const id = c.event.atacante as ObjId;
  if (c.g.state.objects[id]?.zone === 'battlefield') untilEndOfTurn(c, [id], [{ k: 'pt', p: -1, t: 0 }]);
}, { text: 'Sempre que uma criatura de um oponente ataca, ela recebe -1/-0 até o fim do turno.' }));

export default defineCard({
  name: 'Jace, Architect of Thought',
  faces: [{
    abilities: [
      activated('+1', function* (c) {
        // some antes do seu próximo turno acabar de passar por todos (folga de duas voltas; o match corta no seu turno)
        delayed(c, ENFRAQUECE.id!, { once: false, expiresTurn: c.g.state.turn.number + 2 * c.g.state.players.length });
      }, { text: '+1: Até o seu próximo turno, sempre que uma criatura que um oponente controla ataca, ela recebe -1/-0 até o fim do turno.' }),
      activated('−2', function* (c) {
        const s = c.g.state;
        const cartas = s.zones.library[c.you].slice(0, 3);
        if (!cartas.length) return;
        c.g.log(`${s.players[c.you].name} revela ${cartas.map((id) => nameOf(c.g, id)).join(', ')} (Jace).`, { rule: '701.20a' });
        for (const id of cartas) s.objects[id].visibleTo = 'all';
        c.g.bump();
        const item = (id: ObjId): ChoiceItem => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } });
        // ruling 2: você escolhe o oponente (não é alvo); ele separa, você escolhe a pilha
        const ops = c.g.opponents(c.you).filter((p) => !s.players[p].left);
        let quem: PlayerId = c.you;
        if (ops.length === 1) quem = ops[0];
        else if (ops.length > 1) {
          const [p] = yield* chooseItems(c.g, c.you, 'Jace: escolha o oponente que separa as cartas em duas pilhas', ops.map((p) => playerItem(c.g, p)), 1, 1);
          quem = Number(p.slice(1));
        }
        // ruling 3: uma pilha pode ficar vazia
        const pilha1 = (yield* chooseItems(c.g, quem, 'Jace: separe as cartas em duas pilhas — escolha as cartas da primeira pilha (as outras formam a segunda)', cartas.map(item), 0, cartas.length)).map(Number);
        const pilha2 = cartas.filter((id) => !pilha1.includes(id));
        const nomes = (p: ObjId[]) => p.map((id) => nameOf(c.g, id)).join(', ') || 'vazia';
        c.g.log(`${s.players[quem].name} separa as pilhas: [${nomes(pilha1)}] e [${nomes(pilha2)}].`);
        const [esc] = yield* chooseItems(c.g, c.you, 'Jace: escolha a pilha que vai para a sua mão (a outra vai para o fundo do grimório)', [
          { id: '1', label: `Pilha 1: ${nomes(pilha1)}` },
          { id: '2', label: `Pilha 2: ${nomes(pilha2)}` },
        ], 1, 1);
        const mao = esc === '1' ? pilha1 : pilha2;
        const fundo = esc === '1' ? pilha2 : pilha1;
        if (mao.length) yield* moveObjects(c.g, mao.map((id) => ({ id, to: 'hand' as const })), 'effect');
        const resto = fundo.filter((id) => s.objects[id]?.zone === 'library');
        const ordem = resto.length > 1 ? (yield* chooseItems(c.g, c.you, 'Ordem das cartas que vão para o fundo (a primeira fica mais em cima)', resto.map(item), resto.length, resto.length, true)).map(Number) : resto;
        for (const id of ordem) s.objects[id].visibleTo = null; // no fundo do grimório, volta a ficar oculta
        s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !ordem.includes(id)), ...ordem];
        c.g.bump();
      }, { text: '−2: Revele as três cartas do topo do seu grimório. Um oponente as separa em duas pilhas. Coloque uma pilha na sua mão e a outra no fundo do grimório em qualquer ordem.' }),
      activated('−8', function* (c) {
        const s = c.g.state;
        // ruling 4: primeiro exila de todos os grimórios, depois conjura
        const exiladas: ObjId[] = [];
        for (const p of c.g.apnap()) {
          if (s.players[p].left) continue;
          const [achada] = yield* searchLibrary(c.g, c.you, p, { max: 1, filter: (id) => !isLand(c.g, id), prompt: `Jace: procure no grimório de ${s.players[p].name} uma carta que não seja terreno para exilar` });
          if (achada !== undefined) {
            const [ex] = yield* exile(c.g, [achada]);
            if (ex !== null && ex !== undefined) exiladas.push(ex);
          }
          shuffleLibrary(c.g, p);
        }
        // rulings 6-10: uma de cada vez, na ordem que você quiser; a que não for conjurada fica no exílio
        let restantes = exiladas.filter((id) => s.objects[id]?.zone === 'exile');
        while (restantes.length) {
          const [esc] = yield* chooseItems(c.g, c.you, 'Jace: escolha uma carta exilada para conjurar sem pagar o custo de mana (ou nenhuma para parar)',
            [{ id: '', label: 'Não conjurar mais nenhuma' }, ...restantes.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } }))], 1, 1);
          if (!esc) break;
          const id = Number(esc);
          yield* castSpell(c.g, c.you, id, { key: 'free', label: 'sem pagar o custo de mana', zone: 'exile', free: true, duringResolution: true });
          restantes = restantes.filter((x) => x !== id && s.objects[x]?.zone === 'exile');
        }
      }, { text: '−8: Para cada jogador, procure no grimório dele uma carta que não seja terreno e exile-a; depois ele embaralha. Você pode conjurar essas cartas sem pagar os custos de mana.' }),
    ],
  }],
  rulings: {
    1: 'teste: +1: até o seu próximo turno, cada criatura de um oponente que ataca recebe -1/-0',
    2: 'teste: −2: o oponente separa as três em pilhas; uma vai para a mão e a outra para o fundo',
    3: 'teste: −2: o oponente separa as três em pilhas; uma vai para a mão e a outra para o fundo',
    4: 'teste: −8: exila uma carta que não é terreno de cada grimório e conjura de graça as que quiser',
    5: 'regra geral: CR 701.23 — a busca termina quando você escolhe; as cartas só são reveladas ao serem exiladas (motor/actions.ts searchLibrary)',
    6: 'teste: −8: exila uma carta que não é terreno de cada grimório e conjura de graça as que quiser',
    7: 'regra geral: CR 608.2g — conjuradas durante a resolução, ignoram o tempo de feitiço do tipo (motor/stack.ts duringResolution)',
    8: 'teste: −8: exila uma carta que não é terreno de cada grimório e conjura de graça as que quiser',
    9: 'regra geral: CR 118.9 — sem pagar o custo de mana não se usa custo alternativo; os adicionais obrigatórios são pagos (motor/stack.ts)',
    10: 'regra geral: CR 107.3b — conjurada sem pagar o custo de mana, X é 0 (motor/stack.ts)',
  },
});
