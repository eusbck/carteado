// Bloodtithe Harvester
// When this creature enters, create a Blood token. (It's an artifact with "{1}, {T}, Discard a card, Sacrifice this
// token: Draw a card.")
// {T}, Sacrifice this creature: Target creature gets -X/-X until end of turn, where X is twice the number of Blood tokens
// you control. Activate only as a sorcery.
import { activated, createTokens, defineCard, etb, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import { fichasDeSangue } from '../vampiros.ts';

export default defineCard({
  name: 'Bloodtithe Harvester',
  faces: [{
    abilities: [
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Blood', 1); }, { text: 'Quando esta criatura entra, crie uma ficha de Blood.' }),
      activated('{T}, Sacrifice this creature', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // ruling 1: X é contado uma vez, na resolução
        const x = 2 * fichasDeSangue(c.g, c.you).length;
        if (x > 0) untilEndOfTurn(c, [id], [{ k: 'pt', p: -x, t: -x }]);
      }, { timing: 'sorcery', targets: [t.creature()], text: '{T}, Sacrifique esta criatura: A criatura alvo recebe -X/-X até o fim do turno, onde X é o dobro do número de fichas de Blood que você controla. Ative só como feitiço.' }),
    ],
  }],
  rulings: {
    1: 'teste: X é o dobro das fichas de Blood que você controla na resolução',
    2: 'regra geral: ficha de Blood é qualquer ficha de artefato com o subtipo Blood, mesmo com outros subtipos (cartas/vampiros.ts fichasDeSangue)',
    3: 'regra geral: CR 118.3 — um permanente sacrificado paga um custo só (motor/costs.ts)',
    4: 'não se aplica: nenhuma carta dos decks dispara ao sacrificar uma ficha de Blood',
  },
});
