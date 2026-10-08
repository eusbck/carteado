// Expressive Iteration
// Look at the top three cards of your library. Put one of them into your hand, put one of them on the bottom of your
// library, and exile one of them. You may play the exiled card this turn.
import { allowPlay, chooseItems, defineCard, exile, moveObjects, nameOf } from '../../motor/api.ts';
import type { ChoiceItem } from '../../motor/types.ts';

export default defineCard({
  name: 'Expressive Iteration',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        let restantes = s.zones.library[c.you].slice(0, 3);
        const itens = (ids: number[]): ChoiceItem[] => ids.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } }));
        // ruling 3: com menos cartas, segue as instruções na ordem
        if (restantes.length === 0) return;
        const [mao] = (yield* chooseItems(c.g, c.you, 'Expressive Iteration: escolha a carta que vai para a mão', itens(restantes), 1, 1)).map(Number);
        restantes = restantes.filter((id) => id !== mao);
        let fundo: number | null = null;
        if (restantes.length) [fundo] = (yield* chooseItems(c.g, c.you, 'Escolha a carta que vai para o fundo do grimório', itens(restantes), 1, 1)).map(Number);
        const exilar = restantes.filter((id) => id !== fundo);
        yield* moveObjects(c.g, [{ id: mao, to: 'hand' }], 'effect');
        if (fundo !== null) yield* moveObjects(c.g, [{ id: fundo, to: 'library', position: 'bottom' }], 'effect');
        if (exilar.length) {
          const ex = (yield* exile(c.g, exilar)).filter((x): x is number => x !== null);
          // rulings 1-2: joga só neste turno, pagando os custos e respeitando o tempo
          allowPlay(c.g, c.you, c.source, ex, { kind: 'endOfTurn' });
        }
      },
    },
  }],
  rulings: {
    1: 'teste: o terreno exilado pode ser jogado neste turno (se ainda houver jogada de terreno)',
    2: 'regra geral: a permissão acaba no fim do turno (duração endOfTurn)',
    3: 'teste: com duas cartas, uma para a mão e uma para o fundo',
  },
});
