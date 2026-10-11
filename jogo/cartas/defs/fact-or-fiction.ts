// Fact or Fiction
// Reveal the top five cards of your library. An opponent separates those cards into two piles. Put one pile into your
// hand and the other into your graveyard.
import { chooseItems, defineCard, moveObjects, nameOf, playerItem } from '../../motor/api.ts';
import type { ObjId, PlayerId, ZoneName } from '../../motor/types.ts';

export default defineCard({
  name: 'Fact or Fiction',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const cartas = s.zones.library[c.you].slice(0, 5);
        if (cartas.length === 0) return;
        // CR 701.20a: reveladas a todos enquanto o efeito precisa delas
        c.g.log(`${s.players[c.you].name} revela ${cartas.map((id) => nameOf(c.g, id)).join(', ')} (Fact or Fiction).`, { rule: '701.20a' });
        for (const id of cartas) s.objects[id].visibleTo = 'all';
        c.g.bump();
        const item = (id: ObjId) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } });
        // "um oponente": você escolhe qual oponente separa as pilhas
        const ops = c.g.opponents(c.you);
        let quem: PlayerId = c.you;
        if (ops.length === 1) quem = ops[0];
        else if (ops.length > 1) {
          const [p] = yield* chooseItems(c.g, c.you, 'Fact or Fiction: escolha o oponente que separa as cartas em duas pilhas', ops.map((p) => playerItem(c.g, p)), 1, 1);
          quem = Number(p.slice(1));
        }
        // ruling 1: uma pilha pode ficar vazia
        const pilha1 = (yield* chooseItems(c.g, quem, 'Fact or Fiction: separe as cartas em duas pilhas — escolha as cartas da primeira pilha (as outras formam a segunda)', cartas.map(item), 0, cartas.length)).map(Number);
        const pilha2 = cartas.filter((id) => !pilha1.includes(id));
        const nomes = (p: ObjId[]) => p.map((id) => nameOf(c.g, id)).join(', ') || 'vazia';
        c.g.log(`${s.players[quem].name} separa as pilhas: [${nomes(pilha1)}] e [${nomes(pilha2)}].`);
        const [esc] = yield* chooseItems(c.g, c.you, 'Fact or Fiction: escolha a pilha que vai para a sua mão (a outra vai para o cemitério)', [
          { id: '1', label: `Pilha 1: ${nomes(pilha1)}` },
          { id: '2', label: `Pilha 2: ${nomes(pilha2)}` },
        ], 1, 1);
        const mao = esc === '1' ? pilha1 : pilha2;
        const cemiterio = esc === '1' ? pilha2 : pilha1;
        yield* moveObjects(c.g, [
          ...mao.map((id) => ({ id, to: 'hand' as ZoneName })),
          ...cemiterio.map((id) => ({ id, to: 'graveyard' as ZoneName })),
        ], 'effect');
      },
    },
  }],
  rulings: {
    1: 'teste: uma pilha pode ficar vazia',
  },
});
