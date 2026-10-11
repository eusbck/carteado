// Enigma Sphinx
// Flying
// When this creature is put into your graveyard from the battlefield, put it into your library third from the top.
// Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs
// less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)
import { cascade, defineCard, keyword, moveObjects, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Enigma Sphinx',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 11: "no seu cemitério" — só dispara se o cemitério é o do controlador (ele é o dono)
      triggered(on.custom((e, c) => (e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && e.old === c.source && e.owner === e.controller ? { carta: e.obj } : false)), function* (c) {
        const s = c.g.state;
        const id = c.event.carta as ObjId;
        const o = s.objects[id];
        // ruling 12: se já saiu do cemitério, não vai para o grimório
        if (!o || o.zone !== 'graveyard') return;
        const dono = o.owner;
        // ruling 10: com menos de duas cartas no grimório, fica no fundo
        const posicao = Math.min(2, s.zones.library[dono].length);
        yield* moveObjects(c.g, [{ id, to: 'library', position: posicao }], 'effect');
        c.g.log(`Enigma Sphinx vai para o grimório de ${s.players[dono].name}, como a terceira carta a partir do topo.`);
      }, { text: 'Quando esta criatura é colocada no seu cemitério vinda do campo de batalha, coloque-a no seu grimório como a terceira carta a partir do topo.' }),
      // CR 702.85a
      cascade(),
    ],
  }],
  rulings: {
    1: 'não se aplica: cartas split ainda não são conjuráveis pela cascata (formato pendente no motor)',
    2: 'regra geral: CR 118.9 — sem pagar o custo de mana não dá para usar outro custo alternativo (motor/mecanicas.ts mayCastFree)',
    3: 'regra geral: CR 107.3b — X vale 0 ao conjurar sem pagar o custo de mana (motor/stack.ts)',
    4: 'regra geral: CR 702.85a — a mágica resultante também precisa ter valor de mana menor (motor/conjurar-alternativo.ts cascade)',
    5: 'regra geral: CR 202.3 — o valor de mana vem só do custo de mana (motor/chars.ts)',
    6: 'teste: CR 702.85a: ao ser conjurada, a cascata conjura de graça a primeira carta não terreno que custa menos',
    7: 'regra geral: CR 702.85a — exilar é obrigatório; só conjurar é opcional (cartas/defs/into-the-time-vortex.test.ts)',
    8: 'regra geral: CR 702.85a — anulada, a cascata resolve do mesmo jeito (cartas/defs/into-the-time-vortex.test.ts)',
    9: 'regra geral: CR 702.85a — as cartas são exiladas com a face para cima (motor/conjurar-alternativo.ts cascade)',
    10: 'teste: com menos de duas cartas no grimório, vai para o fundo',
    11: 'teste: sob o controle de outro jogador, vai para o cemitério do dono e o gatilho não dispara',
    12: 'teste: se sair do cemitério em resposta, não vai para o grimório',
  },
});
