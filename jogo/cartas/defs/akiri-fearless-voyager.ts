// Akiri, Fearless Voyager
// Whenever you attack a player with one or more equipped creatures, draw a card.
// {W}: You may unattach an Equipment from a creature you control. If you do, tap that creature and it gains
// indestructible until end of turn.
import { activated, chars, chooseItems, controllerOf, defineCard, draw, nameOf, objItem, on, tap, triggered, unattach, untilEndOfTurn } from '../../motor/api.ts';
import { equipada } from '../armaria.ts';

export default defineCard({
  name: 'Akiri, Fearless Voyager',
  faces: [{
    abilities: [
      // ruling 1 e 2: uma compra por jogador atacado com criatura equipada; planeswalker/batalha não contam
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers' || e.player !== c.you) return false;
        const jogadores = [...new Set(e.attackers.filter((a) => a.target.kind === 'player' && equipada(c.g, a.obj)).map((a) => a.target.id))];
        return jogadores.length ? jogadores.map((p) => ({ jogador: p })) : false;
      }), function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Sempre que você ataca um jogador com uma ou mais criaturas equipadas, compre uma carta.' }),
      activated('{W}', function* (c) {
        const s = c.g.state;
        const opcoes = s.zones.battlefield.filter((id) => {
          const alvo = s.objects[id].attachedTo;
          return alvo != null && chars(c.g, id).subtypes.includes('Equipment') && s.zones.battlefield.includes(alvo) && controllerOf(c.g, alvo) === c.you;
        });
        if (!opcoes.length) return;
        // ruling 4: escolhe na resolução, e é opcional
        const [escolhido] = yield* chooseItems(c.g, c.you, 'Desanexe um Equipamento de uma criatura sua (opcional)', opcoes.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (escolhido === undefined) return;
        const eq = Number(escolhido);
        const criatura = s.objects[eq].attachedTo!;
        unattach(c.g, eq);
        tap(c.g, criatura); // ruling 5: se já estiver virada, só ganha indestrutível
        untilEndOfTurn(c, [criatura], [{ k: 'addKeyword', kw: 'indestructible' }]);
      }, { text: '{W}: Você pode desanexar um Equipamento de uma criatura que você controla. Se fizer isso, vire aquela criatura e ela ganha indestrutível até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 506.4 — atacar planeswalker ou batalha não é atacar jogador (on.custom olha o alvo)',
    2: 'teste: ruling 2: uma compra por jogador atacado, não por criatura',
    3: 'teste: {W}: desanexa, vira a criatura e ela ganha indestrutível; o Equipamento fica no campo',
    4: 'teste: {W}: desanexa, vira a criatura e ela ganha indestrutível; o Equipamento fica no campo',
    5: 'regra geral: CR 701.26a — virar uma permanente já virada não faz nada (motor/actions.ts tap)',
  },
});
