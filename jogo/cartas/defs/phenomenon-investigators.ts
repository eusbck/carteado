// Phenomenon Investigators
// As this creature enters, choose Believe or Doubt.
// • Believe — Whenever a nontoken creature you control dies, create a 2/2 black Horror enchantment creature token.
// • Doubt — At the beginning of your end step, you may return a nonland permanent you own to your hand. If you do, draw
// a card.
import { asEnters, chooseItems, createTokens, defineCard, draw, isLand, lkiObj, nameOf, on, returnToHand, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';

/** a escolha feita ao entrar (ruling 1: sem escolha, nenhuma das duas habilidades); saindo do campo, a última conhecida */
const escolha = (g: G, id: ObjId) => lkiObj(g, id)?.choices.crenca as 'acreditar' | 'duvidar' | undefined;

export default defineCard({
  name: 'Phenomenon Investigators',
  faces: [{
    abilities: [
      asEnters(function* (c, ev) {
        const [r] = yield* chooseItems(c.g, c.you, 'Phenomenon Investigators: escolha Acreditar ou Duvidar', [
          { id: 'acreditar', label: 'Acreditar: sempre que uma criatura sua que não é ficha morre, crie uma ficha Horror 2/2' },
          { id: 'duvidar', label: 'Duvidar: na sua etapa final, você pode devolver uma permanente sua para a mão e comprar uma carta' },
        ], 1, 1);
        ev.choices.crenca = r;
      }, 'Ao entrar, escolha Acreditar ou Duvidar.'),
      triggered(on.dies((c, lki, old) => escolha(c.g, c.source) === 'acreditar' && !old.isToken && lki.controller === c.you), function* (c) {
        yield* createTokens(c.g, c.you, 'Horror 2/2', 1);
      }, { text: 'Acreditar — Sempre que uma criatura que não é ficha que você controla morre, crie uma ficha de criatura encantamento Horror 2/2 preta.' }),
      triggered(on.custom((e, c) => e.type === 'step' && e.step === 'end' && e.active === c.you && escolha(c.g, c.source) === 'duvidar'), function* (c) {
        // "uma permanente não terreno de que você é dono", seja quem for que a controle
        const minhas = c.g.state.zones.battlefield.filter((id) => !c.g.state.objects[id].phasedOut && c.g.state.objects[id].owner === c.you && !isLand(c.g, id));
        if (!minhas.length) return;
        const [r] = yield* chooseItems(c.g, c.you, 'Phenomenon Investigators: devolver uma permanente não terreno sua para a mão e comprar uma carta?',
          [{ id: 'nao', label: 'Não devolver' }, ...minhas.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id }))], 1, 1);
        if (r === 'nao') return;
        const [volta] = yield* returnToHand(c.g, [Number(r)]);
        if (volta !== null && volta !== undefined && c.g.state.objects[volta]?.zone === 'hand') yield* draw(c.g, c.you, 1);
      }, { text: 'Duvidar — No começo da sua etapa final, você pode devolver uma permanente não terreno de que você é dono para a sua mão. Se fizer isso, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: posta no campo sem a escolha (cópia sem "ao entrar"), não tem nenhuma das duas habilidades',
  },
});
