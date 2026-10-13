// Faz o L (carta própria da mesa)
// Each opponent chooses one — You exile the top card of their library and may play it this turn, and mana of any type
// can be spent to cast it; or that player sacrifices a creature.
import { allowPlay, chooseOne, creaturesOf, defineCard, eachSacrifices, exile, isCreature } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Faz o L',
  faces: [{
    spell: {
      *effect(c) {
        const g = c.g;
        const exilar: ObjId[] = [];
        // CR 101.4: os oponentes escolhem em ordem de turno; quem não tem criatura não pode escolher sacrificar
        for (const p of g.apnap().filter((x) => g.isOpponent(c.you, x))) {
          const topo = g.state.zones.library[p][0];
          const temCriatura = creaturesOf(g, p).length > 0;
          let modo = 'exilar';
          if (temCriatura && topo !== undefined) {
            modo = yield* chooseOne(g, p, 'Faz o L: escolha um', [
              { id: 'exilar', label: 'O oponente exila a carta do topo do seu grimório e pode jogá-la neste turno' },
              { id: 'sacrificar', label: 'Você sacrifica uma criatura' },
            ]);
          } else if (temCriatura) modo = 'sacrificar';
          if (modo === 'sacrificar') yield* eachSacrifices(c, [p], (id) => isCreature(g, id), 1, 'uma criatura');
          else if (topo !== undefined) exilar.push(topo);
        }
        if (!exilar.length) return;
        const exiladas = (yield* exile(g, exilar)).filter((id): id is ObjId => id !== null && id !== undefined && g.state.objects[id]?.zone === 'exile');
        allowPlay(g, c.you, c.source, exiladas, { kind: 'endOfTurn' }, { anyType: true });
      },
    },
  }],
  rulings: {},
});
