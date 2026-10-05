// Surge to Victory
// Exile target instant or sorcery card from your graveyard. Creatures you control get +X/+0 until end of turn, where X is
// that card's mana value. Whenever a creature you control deals combat damage to a player this turn, copy the exiled card.
// You may cast the copy without paying its mana cost.
import { controllerOf, createObject, creaturesOf, defineAbility, defineCard, delayed, exile, is, manaValue, mayCastFree, triggered, untilEndOfTurn, t, tgt } from '../../motor/api.ts';

const COPIA = defineAbility('Surge to Victory:copia', triggered({
  kind: 'event',
  match: (e, c) => e.type === 'damage' && e.combat && e.target.kind === 'player' && !!c.g.state.objects[e.source] && controllerOf(c.g, e.source) === c.you,
}, function* (c) {
  const def = c.data.def as string;
  // rulings 1-4: cópia da carta, conjurada durante a resolução, sem pagar (X = 0), ignorando o tempo da carta
  const copia = createObject(c.g, { def, owner: c.you, controller: c.you, zone: 'exile', isCopy: true, copyOf: { def, face: 0 } });
  yield* mayCastFree(c.g, c.you, copia.id, `Surge to Victory: conjurar uma cópia de ${def} sem pagar o custo de mana?`);
}, { text: 'Sempre que uma criatura que você controla causa dano de combate a um jogador neste turno, copie a carta exilada. Você pode conjurar a cópia sem pagar o custo de mana.' }));

export default defineCard({
  name: 'Surge to Victory',
  faces: [{
    spell: {
      targets: [t.card('graveyard', is.instantOrSorcery, 'carta de instantânea ou feitiço alvo no seu cemitério')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const def = c.g.state.objects[id].def;
        const x = manaValue(c.g, id);
        yield* exile(c.g, [id]);
        if (x > 0) untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'pt', p: x, t: 0 }]);
        delayed(c, COPIA.id!, { data: { def }, once: false, expiresTurn: c.g.state.turn.number });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 107.3b — sem pagar, X é 0',
    2: 'teste: a cópia é conjurada durante a resolução do gatilho',
    3: 'regra geral: CR 707.12 — copiar não dispara magecraft; conjurar a cópia sim',
    4: 'regra geral: CR 118.9a — sem custo alternativo; custos adicionais podem ser pagos',
  },
});
