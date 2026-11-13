// Bonehoard Dracosaur
// Flying, first strike
// At the beginning of your upkeep, exile the top two cards of your library. You may play them this turn. If you exiled
// a land card this way, create a 3/1 red Dinosaur creature token. If you exiled a nonland card this way, create a
// Treasure token.
import { allowPlay, createTokens, defineCard, exile, isLand, keywords, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Bonehoard Dracosaur',
  faces: [{
    abilities: [
      ...keywords('flying', 'first strike'),
      triggered(on.upkeep('you'), function* (c) {
        const g = c.g;
        const topo = g.state.zones.library[c.you].slice(0, 2);
        if (!topo.length) return;
        const ex = (yield* exile(g, topo)).filter((id): id is ObjId => id !== null && id !== undefined && g.state.objects[id]?.zone === 'exile');
        // ruling 1: custos e momentos normais
        allowPlay(g, c.you, c.source, ex, { kind: 'endOfTurn' });
        // rulings 2-3: no máximo uma ficha de cada; primeiro o Dinosaur, depois o Tesouro
        if (ex.some((id) => isLand(g, id))) yield* createTokens(g, c.you, 'Dinosaur 3/1', 1);
        if (ex.some((id) => !isLand(g, id))) yield* createTokens(g, c.you, 'Treasure', 1);
      }, { text: 'No início da sua manutenção, exile as duas cartas do topo do seu grimório. Você pode jogá-las neste turno. Se exilou uma carta de terreno assim, crie uma ficha de criatura Dinosaur vermelha 3/1. Se exilou uma carta que não é terreno assim, crie uma ficha de Tesouro.' }),
    ],
  }],
  rulings: {
    1: 'teste: pode jogar as cartas exiladas neste turno, pagando os custos',
    2: 'teste: dois terrenos dão um Dinosaur só; um terreno e outra carta dão um de cada',
    3: 'teste: dois terrenos dão um Dinosaur só; um terreno e outra carta dão um de cada',
  },
});
