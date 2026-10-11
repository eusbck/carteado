// Kaalia of the Vast
// Flying
// Whenever Kaalia attacks an opponent, you may put an Angel, Demon, or Dragon creature card from your hand onto the
// battlefield tapped and attacking that opponent.
import { chooseItems, defineCard, isCreature, isSubtype, keyword, nameOf, objItem, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Kaalia of the Vast',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: só dispara atacando um jogador (um oponente), não um planeswalker
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers') return false;
        const a = e.attackers.find((x) => x.obj === c.source);
        return a && a.target.kind === 'player' && c.g.isOpponent(c.you, a.target.id) ? { oponente: a.target.id } : false;
      }), function* (c) {
        const s = c.g.state;
        const oponente = c.event.oponente as PlayerId;
        const cartas = s.zones.hand[c.you].filter((id) => isCreature(c.g, id) && ['Angel', 'Demon', 'Dragon'].some((st) => isSubtype(c.g, id, st)));
        if (!cartas.length) return;
        const esc = yield* chooseItems(c.g, c.you, `Kaalia: você pode pôr no campo, virada e atacando ${s.players[oponente].name}, uma carta de criatura Angel, Demon ou Dragon da sua mão`, cartas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (!esc.length) return;
        // rulings 2-3: entra atacando sem ter sido declarada atacante. Ruling 4: se o oponente saiu da partida, entra
        // virada mas sem atacar ninguém. Ruling 5: ataca o jogador que Kaalia atacou quando o gatilho disparou
        const atacando = s.players[oponente].left ? undefined : { kind: 'player' as const, id: oponente };
        yield* putOntoBattlefield(c.g, [{ id: Number(esc[0]), controller: c.you, tapped: true, attacking: atacando }], 'effect');
      }, { text: 'Sempre que Kaalia ataca um oponente, você pode pôr no campo uma carta de criatura Angel, Demon ou Dragon da sua mão, virada e atacando esse oponente.' }),
    ],
  }],
  rulings: {
    1: 'teste: atacando um planeswalker, o gatilho não dispara',
    2: 'regra geral: CR 508.4 — a criatura entra atacando sem ter sido declarada atacante: "sempre que ataca" não dispara (motor/actions.ts putOntoBattlefield)',
    3: 'regra geral: CR 508.4 — restrições de ataque só valem na declaração dos atacantes (motor/combat.ts validateAttack)',
    4: 'regra geral: CR 508.4a — se o jogador atacado já saiu da partida, a criatura entra virada sem atacar (cartas/defs/kaalia-of-the-vast.ts)',
    5: 'teste: atacando um oponente, põe um Angel, Demon ou Dragon da mão no campo, virado e atacando esse oponente',
  },
});