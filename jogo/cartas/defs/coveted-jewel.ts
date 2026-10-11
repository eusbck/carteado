// Coveted Jewel
// When this artifact enters, draw three cards.
// {T}: Add three mana of any one color.
// Whenever one or more creatures an opponent controls attack you and aren't blocked, that player draws three cards and
// gains control of this artifact. Untap it.
import { controllerOf, defineCard, draw, etb, gainControl, mana, on, triggered, untap } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Coveted Jewel',
  faces: [{
    abilities: [
      etb(function* (c) { yield* draw(c.g, c.you, 3); }, { text: 'Quando este artefato entra, compre três cartas.' }),
      mana(['WWW', 'UUU', 'BBB', 'RRR', 'GGG'], { text: '{T}: Adicione três manas de uma mesma cor qualquer.' }),
      // rulings 1-2: dispara depois de os bloqueadores serem declarados, se sobrou atacante não bloqueada; ruling 3:
      // só as que atacam você, não um planeswalker seu; ruling 4: um gatilho por oponente que atacou
      triggered(on.custom((e, c) => {
        if (e.type !== 'blockers') return false;
        const oponentes = new Set<PlayerId>();
        for (const a of c.g.state.combat?.attackers ?? []) {
          if (a.removed || a.blocked || a.target.kind !== 'player' || a.target.id !== c.you || !c.g.state.objects[a.id]) continue;
          const quem = controllerOf(c.g, a.id);
          if (c.g.isOpponent(c.you, quem)) oponentes.add(quem);
        }
        return [...oponentes].map((jogador) => ({ jogador }));
      }), function* (c) {
        const p = c.event.jogador as PlayerId;
        if (c.g.state.players[p].left) return;
        yield* draw(c.g, p, 3);
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        gainControl(c.g, c.source, p, { kind: 'permanent' }, c.source);
        untap(c.g, c.source);
      }, { text: 'Sempre que uma ou mais criaturas que um oponente controla atacam você e não são bloqueadas, esse jogador compra três cartas e ganha o controle deste artefato. Desvire-o.' }),
    ],
  }],
  rulings: {
    1: 'teste: a atacante não bloqueada dá ao oponente três cartas e o controle da Jewel, desvirada, antes do dano',
    2: 'teste: com todas as atacantes bloqueadas, nada acontece',
    3: 'regra geral: CR 506.2 — só conta a criatura que ataca você, não a que ataca um planeswalker seu (cartas/defs/coveted-jewel.ts)',
    4: 'regra geral: CR 603.2 — um gatilho para cada oponente que atacou você sem ser bloqueado (cartas/defs/coveted-jewel.ts)',
  },
});