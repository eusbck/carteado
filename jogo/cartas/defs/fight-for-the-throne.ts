// Fight for the Throne
// Put a +1/+1 counter on target creature you control. Then it fights target creature an opponent controls. When the
// creature an opponent controls dies this turn, if you control your commander, you become the monarch.
import { addCounters, becomeMonarch, defineAbility, defineCard, delayed, is, on, t, tgt, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { controlaComandante, luta } from '../wakanda.ts';

const MORREU = defineAbility('Fight for the Throne:morreu', triggered(on.custom((e, c) => {
  const criatura = (c as unknown as { delayed?: { data: { criatura?: ObjId } } }).delayed?.data.criatura;
  return e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && e.old === criatura;
}), function* (c) { becomeMonarch(c.g, c.you); }, {
  // CR 603.4: cláusula "se" interveniente
  condition: (c) => controlaComandante(c.g, c.you),
  text: 'Quando a criatura que um oponente controla morrer neste turno, se você controla o seu comandante, você se torna o monarca.',
}));

export default defineCard({
  name: 'Fight for the Throne',
  faces: [{
    spell: {
      targets: [t.creature(is.yours, 'criatura alvo que você controla'), t.creature(is.opponents, 'criatura alvo que um oponente controla')],
      *effect(c) {
        const minha = tgt(c, 0);
        const dele = tgt(c, 1);
        if (minha !== null) addCounters(c.g, { kind: 'obj', id: minha }, '+1/+1', 1, c.you);
        // CR 701.14: sem uma das duas, não há luta
        if (minha !== null && dele !== null) luta(c.g, minha, dele);
        if (dele !== null) delayed(c, MORREU.id!, { data: { criatura: dele }, expiresTurn: c.g.state.turn.number });
      },
    },
  }],
  rulings: {},
});