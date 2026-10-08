// Vraska, Betrayal's Sting
// Compleated ({B/P} can be paid with {B} or 2 life. If life was paid, this planeswalker enters with two fewer loyalty
// counters.)
// 0: You draw a card and lose 1 life. Proliferate.
// −2: Target creature becomes a Treasure artifact with "{T}, Sacrifice this artifact: Add one mana of any color" and loses
// all other card types and abilities.
// −9: If target player has fewer than nine poison counters, they get a number of poison counters equal to the
// difference.
import { activated, addCounters, addEffect, asEnters, defineCard, draw, loseLife, proliferate, t, tgt, tgtPlayer } from '../../motor/api.ts';
import { registry } from '../../motor/defs.ts';

export default defineCard({
  name: "Vraska, Betrayal's Sting",
  faces: [{
    abilities: [
      // CR 702.150a, rulings 1, 5: dois marcadores a menos para cada {B/P} pago com vida ao conjurar
      asEnters((_c, ev) => {
        const vida = Number((ev.spell?.paid as Record<string, unknown> | undefined)?.phyrexianLife ?? 0);
        if (vida > 0) ev.counters.loyalty = Math.max(0, (ev.counters.loyalty ?? 0) - vida);
      }, 'Completada (se vida foi paga pelo {B/P}, entra com dois marcadores de lealdade a menos).'),
      activated('0', function* (c) {
        yield* draw(c.g, c.you, 1);
        loseLife(c.g, c.you, 1, c.source);
        yield* proliferate(c.g, c.you);
      }, { text: '0: Você compra uma carta e perde 1 de vida. Prolifere.' }),
      activated('−2', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // ruling 4: só artefato Tesouro, mantém os supertipos; perde as outras habilidades
        const tesouro = registry.tokens.get('Treasure')!.abilities[0].id!;
        addEffect(c.g, {
          source: c.source, sourceDef: "Vraska, Betrayal's Sting", controller: c.you, duration: { kind: 'permanent' }, affected: [id],
          mods: [{ k: 'setTypes', types: ['Artifact'], subtypes: ['Treasure'], keepSupertypes: true }, { k: 'loseAllAbilities' }, { k: 'addAbility', id: tesouro }],
        });
      }, { targets: [t.creature()], text: '−2: A criatura alvo vira um artefato Tesouro com "{T}, Sacrifique este artefato: Adicione uma mana de qualquer cor" e perde todos os outros tipos de card e habilidades.' }),
      activated('−9', function* (c) {
        const p = tgtPlayer(c);
        if (p === null) return;
        const tem = c.g.state.players[p].counters.poison ?? 0;
        if (tem < 9) addCounters(c.g, { kind: 'player', id: p }, 'poison', 9 - tem, c.you);
      }, { targets: [t.player()], text: '−9: Se o jogador alvo tiver menos de nove marcadores de veneno, ele recebe a diferença em marcadores de veneno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.150a — só a vida paga pelo {B/P} conta',
    2: 'regra geral: CR 202.1 — o valor de mana continua 6',
    3: 'teste: o alvo fica com nove marcadores de veneno',
    4: 'teste: a criatura vira só um artefato Tesouro',
    5: 'regra geral: CR 614.12 — outras substituições de entrada se aplicam normalmente',
  },
});
