// Akiri, Fearless Voyager
// Whenever you attack a player with one or more equipped creatures, draw a card.
// {W}: You may unattach an Equipment from a creature you control. If you do, tap that creature and it gains
// indestructible until end of turn.
import { activated, chars, chooseItems, controllerOf, defineCard, draw, nameOf, objItem, on, tap, triggered, unattach, untilEndOfTurn } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';

const equipada = (g: G, id: ObjId) => g.state.zones.battlefield.some((x) => g.state.objects[x].attachedTo === id && chars(g, x).subtypes.includes('Equipment'));

export default defineCard({
  name: 'Akiri, Fearless Voyager',
  faces: [{
    abilities: [
      // rulings 1-2: uma carta por jogador atacado por criatura equipada; ataque a planeswalker ou batalha não conta
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers' || e.player !== c.you) return false;
        const jogadores = [...new Set(e.attackers.filter((a) => a.target.kind === 'player' && equipada(c.g, a.obj)).map((a) => a.target.id))];
        return jogadores.length ? jogadores.map((jogador) => ({ jogador })) : false;
      }), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que você ataca um jogador com uma ou mais criaturas equipadas, compre uma carta.' }),
      // rulings 3-5: escolhe na resolução; o Equipamento fica no campo; já virada, só ganha indestrutível
      activated('{W}', function* (c) {
        const s = c.g.state;
        const eqs = s.zones.battlefield.filter((x) => {
          const alvo = s.objects[x].attachedTo;
          return alvo !== null && chars(c.g, x).subtypes.includes('Equipment') && s.objects[alvo]?.zone === 'battlefield' && controllerOf(c.g, alvo) === c.you;
        });
        if (!eqs.length) return;
        const itens = eqs.map((x) => objItem(c.g, x, `${nameOf(c.g, x)} (em ${nameOf(c.g, s.objects[x].attachedTo!)})`));
        const [esc] = yield* chooseItems(c.g, c.you, 'Akiri: você pode desanexar um Equipamento de uma criatura sua', itens, 0, 1);
        if (esc === undefined) return;
        const eq = Number(esc);
        const criatura = s.objects[eq].attachedTo!;
        if (!unattach(c.g, eq)) return;
        tap(c.g, criatura);
        untilEndOfTurn(c, [criatura], [{ k: 'addKeyword', kw: 'indestructible' }]);
      }, { text: '{W}: Você pode desanexar um Equipamento de uma criatura que você controla. Se fizer isso, vire aquela criatura e ela ganha indestrutível até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: atacar dois jogadores com criaturas equipadas compra duas cartas; a sem equipamento não conta',
    2: 'teste: atacar dois jogadores com criaturas equipadas compra duas cartas; a sem equipamento não conta',
    3: 'teste: {W}: desanexa, vira a criatura e ela ganha indestrutível; o Equipamento fica no campo',
    4: 'teste: {W}: desanexa, vira a criatura e ela ganha indestrutível; o Equipamento fica no campo',
    5: 'regra geral: CR 701.26a — virar uma permanente já virada não faz nada; ela ganha indestrutível do mesmo jeito (motor/actions.ts tap)',
  },
});
