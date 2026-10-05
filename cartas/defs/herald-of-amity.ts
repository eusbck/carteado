// Herald of Amity
// Flying
// When this creature enters, exile the top eight cards of your library. You may cast an Aura spell from among them
// without paying its mana cost. Then put the rest on the bottom of your library in a random order.
// Whenever this creature attacks, it gets +X/+X until end of turn, where X is the number of Auras you control.
import { chooseItems, controlledBy, defineCard, etb, exile, isSubtype, keyword, mayCastFree, moveObjects, nameOf, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';

export default defineCard({
  name: 'Herald of Amity',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const s = c.g.state;
        const exiladas = (yield* exile(c.g, s.zones.library[c.you].slice(0, 8))).filter((x): x is number => x !== null);
        // rulings 1, 3-4: conjura durante a resolução, sem custo de mana (X = 0), ignorando o tempo
        const auras = exiladas.filter((id) => isSubtype(c.g, id, 'Aura'));
        if (auras.length) {
          const [esc] = yield* chooseItems(c.g, c.you, 'Herald of Amity: escolha uma Aura para conjurar sem pagar o custo de mana (ou nenhuma)',
            auras.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } })), 0, 1);
          if (esc !== undefined) yield* mayCastFree(c.g, c.you, Number(esc), `Conjurar ${nameOf(c.g, Number(esc))} sem pagar o custo de mana?`);
        }
        const resto = shuffle(s.rng, exiladas.filter((id) => s.objects[id]?.zone === 'exile'));
        if (resto.length) yield* moveObjects(c.g, resto.map((id) => ({ id, to: 'library' as const, position: 'bottom' as const })), 'effect');
      }, { text: 'Quando esta criatura entra, exile as oito cartas do topo do seu grimório. Você pode conjurar uma mágica de Aura entre elas sem pagar o custo de mana. Depois coloque o resto no fundo do grimório em ordem aleatória.' }),
      triggered(on.selfAttacks(), function* (c) {
        // ruling 2: X calculado na resolução
        const x = controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Aura')).length;
        if (x > 0 && c.g.state.objects[c.source]) untilEndOfTurn(c, [c.source], [{ k: 'pt', p: x, t: x }]);
      }, { text: 'Sempre que esta criatura ataca, ela recebe +X/+X até o fim do turno, onde X é o número de Auras que você controla.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 107.3b — sem pagar o custo de mana, X é 0',
    2: 'teste: X conta as Auras na resolução',
    3: 'regra geral: CR 118.9a — sem custo alternativo; custos adicionais podem ser pagos',
    4: 'teste: conjura a Aura durante a resolução, mesmo fora do tempo de feitiço',
  },
});
