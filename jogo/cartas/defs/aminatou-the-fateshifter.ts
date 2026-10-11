// Aminatou, the Fateshifter
// +1: Draw a card, then put a card from your hand on top of your library.
// −1: Exile another target permanent you own, then return it to the battlefield under your control.
// −6: Choose left or right. Each player gains control of all nonland permanents other than Aminatou controlled by the
// next player in the chosen direction.
// Aminatou, the Fateshifter can be your commander.
import {
  activated, and, chooseItems, chooseOne, controlledBy, defineCard, draw, exile, gainControl, is, isLand, moveObjects, nameOf, objItem, putOntoBattlefield,
  seatNeighbor, t, tgt,
} from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Aminatou, the Fateshifter',
  faces: [{
    abilities: [
      activated('+1', function* (c) {
        const s = c.g.state;
        // ruling 1: tudo durante a resolução, sem prioridade no meio
        yield* draw(c.g, c.you, 1);
        const mao = s.zones.hand[c.you];
        if (!mao.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Aminatou: coloque uma carta da sua mão no topo do seu grimório', mao.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
        yield* moveObjects(c.g, [{ id: Number(esc), to: 'library', position: 'top' }], 'effect');
      }, { text: '+1: Compre uma carta, depois coloque uma carta da sua mão no topo do seu grimório.' }),
      activated('−1', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // rulings 3-4: volta como objeto novo, sob o seu controle; a ficha deixa de existir
        const [ex] = yield* exile(c.g, [id]);
        if (ex !== null && ex !== undefined && c.g.state.objects[ex]?.zone === 'exile') yield* putOntoBattlefield(c.g, [{ id: ex, controller: c.you }], 'effect');
      }, {
        // ruling 2: qualquer permanente de que você é dono, mesmo controlada por outro jogador
        targets: [t.permanent(and(is.ownedByYou, is.other), 'outra permanente alvo de que você é dono')],
        text: '−1: Exile outra permanente alvo de que você é dono, depois devolva-a ao campo sob o seu controle.',
      }),
      activated('−6', function* (c) {
        const s = c.g.state;
        const dir = (yield* chooseOne(c.g, c.you, 'Aminatou: escolha a direção', [{ id: 'left', label: 'Esquerda' }, { id: 'right', label: 'Direita' }])) as 'left' | 'right';
        // ruling 5: quem controla o quê é visto antes de qualquer troca; depois tudo muda ao mesmo tempo
        const trocas: { id: ObjId; para: PlayerId }[] = [];
        for (const p of c.g.apnap()) {
          const vizinho = seatNeighbor(c.g, p, dir);
          if (vizinho === p) continue;
          for (const id of controlledBy(c.g, vizinho, (x) => !isLand(c.g, x) && x !== c.source)) trocas.push({ id, para: p });
        }
        c.g.log(`${s.players[c.you].name} escolhe ${dir === 'left' ? 'esquerda' : 'direita'}: cada jogador ganha o controle das permanentes que não são terrenos do jogador à ${dir === 'left' ? 'esquerda' : 'direita'} dele.`);
        // ruling 6: sem prazo; não depende de Aminatou nem de quem a controla
        for (const tr of trocas) gainControl(c.g, tr.id, tr.para, { kind: 'permanent' }, c.source);
      }, { text: '−6: Escolha esquerda ou direita. Cada jogador ganha o controle de todas as permanentes que não são terrenos, exceto Aminatou, controladas pelo próximo jogador na direção escolhida.' }),
    ],
  }],
  rulings: {
    1: 'teste: +1: você compra uma carta e depois coloca uma carta da mão no topo do grimório',
    2: 'teste: −1: uma permanente sua que outro jogador controla volta sob o seu controle',
    3: 'teste: −1: a permanente volta como objeto novo, sem os marcadores',
    4: 'regra geral: CR 111.7 — a ficha exilada deixa de existir e não volta (motor/sba.ts)',
    5: 'teste: −6: com três jogadores, cada um fica com as permanentes do próximo jogador na direção escolhida, menos Aminatou',
    6: 'regra geral: CR 611.2a — o efeito de controle não tem prazo (motor/actions.ts gainControl, duração permanente)',
    7: 'teste: −6: com dois jogadores, vocês trocam tudo o que não é terreno, menos Aminatou',
    8: 'regra geral: CR 800.4a — quando um jogador sai, os efeitos que dão a ele o controle de algo terminam (motor/sba.ts leaveGame)',
  },
});
