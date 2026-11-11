// Akiri, Fearless Voyager
// Whenever you attack a player with one or more equipped creatures, draw a card.
// {W}: You may unattach an Equipment from a creature you control. If you do, tap that creature and it gains
// indestructible until end of turn.
import { activated, chars, chooseItems, controllerOf, defineCard, draw, isCreature, nameOf, objItem, on, tap, triggered, unattach, untilEndOfTurn } from '../../motor/api.ts';
import { ehEquipada } from '../equipar.ts';

export default defineCard({
  name: 'Akiri, Fearless Voyager',
  faces: [{
    abilities: [
      // rulings 1 e 2: um gatilho por jogador atacado por ao menos uma criatura equipada; planeswalkers e batalhas não contam
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers' || e.player !== c.you) return false;
        const jogadores = [...new Set(e.attackers.filter((a) => a.target.kind === 'player' && ehEquipada(c.g, a.obj)).map((a) => a.target.id))];
        return jogadores.length ? jogadores.map((jogador) => ({ jogador })) : false;
      }), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que você ataca um jogador com uma ou mais criaturas equipadas, compre uma carta.' }),
      activated('{W}', function* (c) {
        const s = c.g.state;
        // ruling 4: o Equipamento é escolhido na resolução
        const eqs = s.zones.battlefield.filter((id) => {
          const a = s.objects[id].attachedTo;
          return a !== null && chars(c.g, id).subtypes.includes('Equipment') && !!s.objects[a] && isCreature(c.g, a) && controllerOf(c.g, a) === c.you;
        });
        if (!eqs.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Akiri: você pode desanexar um Equipamento de uma criatura sua', eqs.map((id) => objItem(c.g, id, `${nameOf(c.g, id)} (de ${nameOf(c.g, s.objects[id].attachedTo!)})`)), 0, 1);
        if (!esc.length) return;
        const eq = Number(esc[0]);
        const criatura = s.objects[eq].attachedTo!;
        // ruling 3: o Equipamento continua no campo; ruling 4: só ele é desanexado, e nada acontece no meio
        if (!unattach(c.g, eq)) return;
        // ruling 5: se já estiver virada, só ganha indestrutível
        tap(c.g, criatura);
        untilEndOfTurn(c, [criatura], [{ k: 'addKeyword', kw: 'indestructible' }]);
      }, { text: '{W}: Você pode desanexar um Equipamento de uma criatura que você controla. Se fizer isso, vire essa criatura e ela ganha indestrutível até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: atacar um planeswalker com a criatura equipada não compra',
    2: 'teste: uma compra por jogador atacado com criatura equipada, não importa quantas nem quantos Equipamentos',
    3: 'teste: {W}: desanexa o Equipamento escolhido, que fica no campo; a criatura vira e ganha indestrutível',
    4: 'teste: {W}: desanexa o Equipamento escolhido, que fica no campo; a criatura vira e ganha indestrutível',
    5: 'teste: com a criatura já virada, só ganha indestrutível',
  },
});
