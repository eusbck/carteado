// Brainstealer Dragon
// Flying
// At the beginning of your end step, exile the top card of each opponent's library. You may play those cards for as
// long as they remain exiled. If you cast a spell this way, you may spend mana as though it were mana of any color to
// cast it.
// Whenever a nonland permanent an opponent owns enters the battlefield under your control, they lose life equal to its
// mana value.
import { allowPlay, controllerOf, defineCard, exile, isLand, keyword, loseLife, manaValue, on, triggered } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Brainstealer Dragon',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.endStep('you'), function* (c) {
        const g = c.g;
        const topos = g.apnap().filter((p) => g.isOpponent(c.you, p) && !g.state.players[p].left).map((p) => g.state.zones.library[p][0]).filter((id): id is ObjId => id !== undefined);
        if (!topos.length) return;
        const exiladas = (yield* exile(g, topos)).filter((id): id is ObjId => id !== null && id !== undefined && g.state.objects[id]?.zone === 'exile');
        // "qualquer cor": o motor usa a permissão de qualquer tipo (motor/mana.ts anyType)
        allowPlay(g, c.you, c.source, exiladas, { kind: 'permanent' }, { anyType: true });
      }, { text: 'No início da sua etapa final, exile a carta do topo do grimório de cada oponente. Você pode jogar essas cartas enquanto continuarem exiladas. Se conjurar uma mágica assim, pode gastar mana como se fosse mana de qualquer cor para conjurá-la.' }),
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.to !== 'battlefield' || !c.g.state.objects[e.obj]) return false;
        if (!c.g.isOpponent(c.you, e.owner) || controllerOf(c.g, e.obj) !== c.you || isLand(c.g, e.obj)) return false;
        return { dono: e.owner, valor: manaValue(c.g, e.obj) };
      }), function* (c) {
        const dono = c.event.dono as PlayerId;
        const valor = c.event.valor as number;
        if (valor > 0 && !c.g.state.players[dono].left) loseLife(c.g, dono, valor, c.source);
      }, { text: 'Sempre que um permanente não terreno de que um oponente é dono entra no campo sob o seu controle, ele perde vida igual ao valor de mana desse permanente.' }),
    ],
  }],
  rulings: {},
});
