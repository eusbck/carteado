// Dance with Calamity
// Shuffle your library. As many times as you choose, you may exile the top card of your library. If the total mana value
// of the cards exiled this way is 13 or less, you may cast any number of spells from among those cards without paying
// their mana costs.
import { chooseItems, defineCard, exile, isLand, manaValue, mayCastFree, nameOf, shuffleLibrary, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Dance with Calamity',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        shuffleLibrary(c.g, c.you);
        const exiladas: ObjId[] = [];
        let total = 0;
        // ruling 1: vê cada carta antes de decidir continuar
        for (;;) {
          const topo = s.zones.library[c.you][0];
          if (topo === undefined) break;
          const texto = exiladas.length ? `Dance with Calamity: total ${total}. Exilar mais uma carta do topo?` : 'Dance with Calamity: exilar a carta do topo do grimório?';
          if (!(yield* yesNo(c.g, c.you, texto))) break;
          const [ex] = yield* exile(c.g, [topo]);
          if (ex === null || ex === undefined) break;
          exiladas.push(ex);
          total += manaValue(c.g, ex);
          c.g.log(`${s.players[c.you].name} exila ${nameOf(c.g, ex)} (total ${total}).`, { rule: '406.3' });
        }
        // ruling 7: passou de 13, nada é conjurado
        if (total > 13) return;
        // rulings 2-6: conjura durante a resolução, na ordem escolhida, sem pagar (X = 0), ignorando o tempo
        for (;;) {
          const cands = exiladas.filter((id) => s.objects[id]?.zone === 'exile' && !isLand(c.g, id));
          if (!cands.length) break;
          const [esc] = yield* chooseItems(c.g, c.you, 'Dance with Calamity: escolha a próxima mágica para conjurar sem pagar (ou pare)', [{ id: '', label: 'Parar' }, ...cands.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } }))], 1, 1);
          if (!esc) break;
          const id = Number(esc);
          if (!(yield* mayCastFree(c.g, c.you, id, `Conjurar ${nameOf(c.g, id)} sem pagar o custo de mana?`))) exiladas.splice(exiladas.indexOf(id), 1);
        }
      },
    },
  }],
  rulings: {
    1: 'teste: vê cada carta antes de decidir continuar',
    2: 'regra geral: CR 118.9a — sem custo alternativo; custos adicionais podem ser pagos',
    3: 'regra geral: CR 107.3b — X vale 0',
    4: 'regra geral: CR 608.2g — conjura durante a resolução, ignorando o tempo',
    5: 'regra geral: as cartas não conjuradas, inclusive terrenos, ficam no exílio',
    6: 'regra geral: CR 608.2g — você escolhe a ordem; as mágicas de permanente resolvem depois',
    7: 'teste: passou de 13, nada é conjurado',
  },
});
