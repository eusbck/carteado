// Make an Example
// Each opponent separates the creatures they control into two piles. For each opponent, you choose one of their piles.
// Each opponent sacrifices the creatures in their chosen pile. (Piles can be empty.)
import { chooseItems, creaturesOf, defineCard, nameOf, objItem, sacrifice } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Make an Example',
  faces: [{
    spell: {
      *effect(c) {
        const g = c.g;
        const s = g.state;
        const pilhas: { p: PlayerId; a: ObjId[]; b: ObjId[] }[] = [];
        // CR 101.4: os oponentes separam em ordem de turno; uma pilha pode ficar vazia
        for (const p of g.apnap().filter((x) => g.isOpponent(c.you, x))) {
          const criaturas = creaturesOf(g, p);
          const esc = criaturas.length ? yield* chooseItems(g, p, 'Make an Example: separe as suas criaturas em duas pilhas — escolha as da primeira pilha (as outras ficam na segunda)', criaturas.map((id) => objItem(g, id, nameOf(g, id))), 0, criaturas.length) : [];
          const a = esc.map(Number);
          pilhas.push({ p, a, b: criaturas.filter((id) => !a.includes(id)) });
        }
        const sacrificar: ObjId[] = [];
        // ruling 1: quem escolhe a pilha de cada oponente é você
        for (const { p, a, b } of pilhas) {
          const nomes = (ids: ObjId[]) => (ids.length ? ids.map((id) => nameOf(g, id)).join(', ') : 'vazia');
          const [qual] = yield* chooseItems(g, c.you, `Make an Example: qual pilha ${s.players[p].name} sacrifica?`, [
            { id: 'a', label: `Primeira pilha: ${nomes(a)}` },
            { id: 'b', label: `Segunda pilha: ${nomes(b)}` },
          ], 1, 1);
          sacrificar.push(...(qual === 'a' ? a : b));
        }
        const noCampo = sacrificar.filter((id) => s.objects[id]?.zone === 'battlefield');
        if (noCampo.length) yield* sacrifice(g, noCampo);
      },
    },
  }],
  rulings: {
    1: 'teste: cada oponente separa as criaturas em duas pilhas e você escolhe qual pilha de cada um é sacrificada',
  },
});
