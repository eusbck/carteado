// Victor, Valgavoth's Seneschal
// Eerie — Whenever an enchantment you control enters and whenever you fully unlock a Room, surveil 2 if this is the first
// time this ability has resolved this turn. If it's the second time, each opponent discards a card. If it's the third
// time, put a creature card from a graveyard onto the battlefield under your control.
import { chooseItems, defineCard, discard, isCreature, isType, lookAndArrange, nameOf, objItem, on, putOntoBattlefield, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Victor, Valgavoth\'s Seneschal',
  faces: [{
    abilities: [
      // ruling 1: um gatilho por encantamento; ruling 3: não há Rooms nos decks
      triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && e.controller === c.you && !!c.g.state.objects[e.obj] && isType(c.g, e.obj, 'Enchantment')), function* (c) {
        const s = c.g.state;
        const eu = s.objects[c.source];
        // contagem de resoluções neste turno (fica com o objeto; se Victor saiu, conta pela última informação)
        const dados = eu?.data ?? s.lki[c.source]?.obj.data ?? {};
        const vez = dados.eerieTurno === s.turn.number ? (dados.eerieVezes as number) + 1 : 1;
        if (eu) { eu.data.eerieTurno = s.turn.number; eu.data.eerieVezes = vez; }
        if (vez === 1) yield* lookAndArrange(c.g, c.you, 2, 'surveil');
        else if (vez === 2) { for (const p of c.g.apnap().filter((x) => c.g.isOpponent(c.you, x))) yield* discard(c.g, p, 1); }
        else if (vez === 3) {
          const cands = c.g.playersInGame().flatMap((p) => s.zones.graveyard[p]).filter((id) => isCreature(c.g, id));
          if (!cands.length) return;
          const [id] = yield* chooseItems(c.g, c.you, 'Victor: escolha uma carta de criatura de um cemitério para pôr no campo', cands.map((x) => objItem(c.g, x, `${nameOf(c.g, x)} (${s.players[s.objects[x].owner].name})`)), 1, 1);
          yield* putOntoBattlefield(c.g, [{ id: Number(id), controller: c.you }], 'effect');
        }
        // ruling 2: da quarta vez em diante, nada
      }, { text: 'Arrepio — Sempre que um encantamento que você controla entra, vigie 2 se esta for a primeira vez que esta habilidade resolve neste turno. Se for a segunda, cada oponente descarta uma carta. Se for a terceira, ponha uma carta de criatura de um cemitério no campo sob seu controle.' }),
    ],
  }],
  rulings: {
    1: 'teste: dois encantamentos entrando juntos disparam duas vezes',
    2: 'teste: da quarta vez em diante, nada',
    3: 'não se aplica: nenhuma Room nos decks',
  },
});
