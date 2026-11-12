// Sephiroth, Fabled SOLDIER // Sephiroth, One-Winged Angel
// Frente — Whenever Sephiroth enters or attacks, you may sacrifice another creature. If you do, draw a card.
// Whenever another creature dies, target opponent loses 1 life and you gain 1 life. If this is the fourth time this
// ability has resolved this turn, transform Sephiroth.
// //
// Verso — Flying
// Super Nova — As this creature transforms into Sephiroth, One-Winged Angel, you get an emblem with "Whenever a creature
// dies, target opponent loses 1 life and you gain 1 life."
// Whenever Sephiroth attacks, you may sacrifice any number of other creatures. If you do, draw that many cards.
import { contaResolucao, createEmblem, defineCard, defineEmblem, draw, keyword, on, staticAbility, t, tgtPlayer, transformFrom, triggered } from '../../motor/api.ts';
import type { Ctx } from '../../motor/defs.ts';
import { drena1, EMBLEMA_SEPHIROTH, sacrifiqueQuantasQuiser, talvezSacrifiqueOutra } from '../sephiroth.ts';

const NOME = 'Sephiroth, Fabled SOLDIER // Sephiroth, One-Winged Angel';
const CHAVE_DRENO = 'Sephiroth:dreno';

// CR 114: o emblema fica na zona de comando e a habilidade funciona de lá
defineEmblem({
  id: EMBLEMA_SEPHIROTH,
  name: 'Emblema de Sephiroth',
  abilities: [
    triggered(on.dies(() => true), function* (c) {
      drena1(c, tgtPlayer(c));
    }, { targets: [t.opponent()], text: 'Sempre que uma criatura morre, o oponente alvo perde 1 de vida e você ganha 1 de vida.' }),
  ],
});

function* sacrificaECompra(c: Ctx) {
  if ((yield* talvezSacrifiqueOutra(c, 'Sephiroth')) !== null) yield* draw(c.g, c.you, 1);
}

const TEXTO_ENTRA_ATACA = 'Sempre que Sephiroth entra ou ataca, você pode sacrificar outra criatura. Se fizer isso, compre uma carta.';

export default defineCard({
  name: NOME,
  faces: [
    {
      abilities: [
        triggered(on.selfEnters(), sacrificaECompra, { text: TEXTO_ENTRA_ATACA }),
        triggered(on.selfAttacks(), sacrificaECompra, { text: TEXTO_ENTRA_ATACA }),
        // ruling 3: morrendo junto com outras criaturas, dispara para cada uma delas (olha para trás, CR 603.10a)
        triggered(on.dies((c, _lki, old) => old.id !== c.source), function* (c) {
          drena1(c, tgtPlayer(c));
          // contagem por objeto e por turno (motor/resolucoes.ts); a quarta resolução transforma (CR 701.27)
          if (contaResolucao(c.g, c.source, CHAVE_DRENO) !== 4) return;
          // CR 701.27f: só transforma se ainda estiver com a frente para cima. Super Nova: "ao se transformar" (efeito estático,
          // sem pilha) — o emblema vem junto com a transformação; entrar transformado não dá emblema (ruling 6)
          if (transformFrom(c.g, c.source, 0)) createEmblem(c.g, c.you, EMBLEMA_SEPHIROTH);
        }, { targets: [t.opponent()], text: 'Sempre que outra criatura morre, o oponente alvo perde 1 de vida e você ganha 1 de vida. Se esta é a quarta vez que esta habilidade resolveu neste turno, transforme Sephiroth.' }),
      ],
    },
    {
      abilities: [
        keyword('flying'),
        staticAbility({ text: 'Super Nova — Quando esta criatura se transforma em Sephiroth, One-Winged Angel, você recebe um emblema com "Sempre que uma criatura morre, o oponente alvo perde 1 de vida e você ganha 1 de vida."' }),
        triggered(on.selfAttacks(), function* (c) {
          const n = yield* sacrifiqueQuantasQuiser(c, 'Sephiroth');
          if (n > 0) yield* draw(c.g, c.you, n);
        }, { text: 'Sempre que Sephiroth ataca, você pode sacrificar qualquer número de outras criaturas. Se fizer isso, compre essa quantidade de cartas.' }),
      ],
    },
  ],
  rulings: {
    1: 'teste: na quarta resolução no turno, Sephiroth transforma e você recebe o emblema',
    2: 'regra geral: CR 712.14 — entra com a frente para cima (motor/actions.ts)',
    3: 'teste: morrendo junto com outras criaturas, dispara para cada uma, mas não transforma',
    4: 'regra geral: CR 903.4 — a identidade de cor soma as duas faces (motor/oracle.ts)',
    5: 'teste: o comandante transformado que vai para a zona de comando volta com a frente para cima',
    6: 'regra geral: CR 712.14 — nada nos decks põe Sephiroth no campo transformado; o emblema vem só da transformação',
    7: 'regra geral: CR 712.8 — o valor de mana é o da frente (motor/chars.ts)',
    8: 'regra geral: CR 204 — o verso tem indicador de cor (motor/oracle.ts)',
    9: 'regra geral: CR 707.8 — a ficha que copia uma carta de duas faces tem as duas faces (motor/criaturas.ts)',
    10: 'não se aplica: nenhuma carta dos decks põe uma carta de uma face só no campo transformada',
  },
});
