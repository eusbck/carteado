// Jocasta, Automaton Avenger
// Flying
// Whenever your commander deals combat damage to a player, put a +1/+1 counter on Jocasta.
// Whenever you attack with your commander, if this card is in your graveyard, you may return it to the battlefield
// tapped and attacking.
import { addCounters, chooseItems, defineCard, keyword, on, playerItem, putOntoBattlefield, triggered, yesNo } from '../../motor/api.ts';
import { ehSeuComandante } from '../vingadores.ts';

export default defineCard({
  name: 'Jocasta, Automaton Avenger',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.custom((e, c) => e.type === 'damage' && e.combat && e.target.kind === 'player' && ehSeuComandante(c.g, e.source, c.you)), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que o seu comandante causa dano de combate a um jogador, coloque um marcador +1/+1 em Jocasta.' }),
      // funciona só no cemitério (CR 113.6); "se esta carta estiver no seu cemitério" é conferido de novo ao resolver
      triggered(on.custom((e, c) => e.type === 'attackers' && e.player === c.you && e.attackers.some((a) => ehSeuComandante(c.g, a.obj, c.you))), function* (c) {
        const s = c.g.state;
        if (s.objects[c.source]?.zone !== 'graveyard' || !s.combat) return;
        if (!(yield* yesNo(c.g, c.you, 'Jocasta: devolver do cemitério ao campo virada e atacando?'))) return;
        // CR 508.4: quem a controla escolhe o jogador que ela ataca
        const oponentes = c.g.playersInGame().filter((p) => c.g.isOpponent(c.you, p));
        if (!oponentes.length) return;
        let alvo = oponentes[0];
        if (oponentes.length > 1) {
          const [esc] = yield* chooseItems(c.g, c.you, 'Jocasta ataca qual jogador?', oponentes.map((p) => playerItem(c.g, p)), 1, 1);
          alvo = Number(String(esc).replace(/^p/, ''));
        }
        yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you, tapped: true, attacking: { kind: 'player', id: alvo } }], 'effect');
      }, { zones: ['graveyard'], text: 'Sempre que você ataca com o seu comandante, se esta carta estiver no seu cemitério, você pode devolvê-la ao campo virada e atacando.' }),
    ],
  }],
  rulings: {},
});