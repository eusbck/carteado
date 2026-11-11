// Sephiroth, Fabled SOLDIER // Sephiroth, One-Winged Angel
// Frente — Whenever Sephiroth enters or attacks, you may sacrifice another creature. If you do, draw a card.
// Whenever another creature dies, target opponent loses 1 life and you gain 1 life. If this is the fourth time this
// ability has resolved this turn, transform Sephiroth.
// Verso — Flying
// Super Nova — As this creature transforms into Sephiroth, One-Winged Angel, you get an emblem with "Whenever a creature
// dies, target opponent loses 1 life and you gain 1 life."
// Whenever Sephiroth attacks, you may sacrifice any number of other creatures. If you do, draw that many cards.
import {
  chooseItems, controlledBy, createEmblem, defineCard, defineEmblem, draw, gainLife, isCreature, keyword, loseLife, nameOf, objItem, on,
  sacrifice, t, tgtPlayer, transformFrom, triggered, yesNo,
} from '../../motor/api.ts';
import type { Ctx, Gen } from '../../motor/defs.ts';

const NOME = 'Sephiroth, Fabled SOLDIER // Sephiroth, One-Winged Angel';
const CONTA = 'sephiroth:drenos';
const EMBLEMA = 'Sephiroth, One-Winged Angel (emblema)';

function* drena(c: Ctx): Gen<void> {
  const p = tgtPlayer(c);
  if (p !== null) loseLife(c.g, p, 1, c.source);
  gainLife(c.g, c.you, 1, c.source);
}

defineEmblem({
  id: EMBLEMA,
  name: 'Emblema de Sephiroth (Super Nova)',
  abilities: [triggered(on.dies(() => true), drena, { targets: [t.opponent()], text: 'Sempre que uma criatura morre, o oponente alvo perde 1 de vida e você ganha 1 de vida.' })],
});

const outras = (c: Ctx) => controlledBy(c.g, c.you, (id) => id !== c.source && isCreature(c.g, id));

function* sacrificaUmaECompra(c: Ctx): Gen<void> {
  const cands = outras(c);
  if (!cands.length) return;
  if (!(yield* yesNo(c.g, c.you, 'Sephiroth: sacrificar outra criatura para comprar uma carta?'))) return;
  const [id] = yield* chooseItems(c.g, c.you, 'Sacrifique outra criatura', cands.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
  const [foi] = yield* sacrifice(c.g, [Number(id)]);
  if (foi !== null && foi !== undefined) yield* draw(c.g, c.you, 1);
}

export default defineCard({
  name: NOME,
  faces: [
    {
      abilities: [
        triggered(on.selfEnters(), sacrificaUmaECompra, { text: 'Sempre que Sephiroth entra, você pode sacrificar outra criatura. Se fizer isso, compre uma carta.' }),
        triggered(on.selfAttacks(), sacrificaUmaECompra, { text: 'Sempre que Sephiroth ataca, você pode sacrificar outra criatura. Se fizer isso, compre uma carta.' }),
        triggered(on.dies((c, _l, o) => o.id !== c.source), function* (c) {
          yield* drena(c);
          // "se esta for a quarta vez que esta habilidade resolveu neste turno"
          const s = c.g.state;
          const eu = s.objects[c.source];
          if (!eu || eu.zone !== 'battlefield') return;
          const n = eu.usedThisTurn[CONTA] === s.turn.number ? ((eu.data.drenos as number) ?? 0) + 1 : 1;
          eu.usedThisTurn[CONTA] = s.turn.number;
          eu.data.drenos = n;
          if (n === 4 && eu.face === 0 && transformFrom(c.g, c.source, 0)) createEmblem(c.g, c.you, EMBLEMA); // Super Nova
        }, { targets: [t.opponent()], text: 'Sempre que outra criatura morre, o oponente alvo perde 1 de vida e você ganha 1 de vida. Se esta for a quarta vez que esta habilidade resolveu neste turno, transforme Sephiroth.' }),
      ],
    },
    {
      abilities: [
        keyword('flying'),
        triggered(on.selfAttacks(), function* (c) {
          const cands = outras(c);
          if (!cands.length) return;
          const ids = yield* chooseItems(c.g, c.you, 'Sephiroth: sacrifique quantas outras criaturas quiser (compra uma carta para cada)', cands.map((x) => objItem(c.g, x, nameOf(c.g, x))), 0, cands.length);
          if (!ids.length) return;
          const foram = (yield* sacrifice(c.g, ids.map(Number))).filter((x) => x !== null).length;
          if (foram > 0) yield* draw(c.g, c.you, foram);
        }, { text: 'Sempre que Sephiroth ataca, você pode sacrificar qualquer número de outras criaturas. Se fizer isso, compre essa quantidade de cartas.' }),
      ],
    },
  ],
  rulings: {
    1: 'teste: na quarta resolução do turno transforma e você recebe o emblema',
    2: 'regra geral: CR 603.10a — a habilidade dispara pelas criaturas que morrem junto com outras',
    3: 'regra geral: CR 114.4 — o emblema fica na zona de comando e vale até o fim do jogo',
    4: 'regra geral: CR 701.28 — transformado, ele continua sendo o mesmo objeto (marcadores e Auras ficam)',
  },
});
