// Urza, Lord High Artificer
// When Urza enters, create a 0/0 colorless Construct artifact creature token with "This token gets +1/+1 for each
// artifact you control."
// Tap an untapped artifact you control: Add {U}.
// {5}: Shuffle your library, then exile the top card. Until end of turn, you may play that card without paying its mana
// cost.
import { activated, allowPlay, createTokens, defineCard, etb, exile, isType, mana, shuffleLibrary } from '../../motor/api.ts';

export default defineCard({
  name: 'Urza, Lord High Artificer',
  faces: [{
    abilities: [
      // ruling 1: a ficha conta a si mesma
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Construct (artefatos)', 1); }, { text: 'Quando Urza entra, crie uma ficha de criatura artefato Construct 0/0 incolor com "Esta ficha recebe +1/+1 para cada artefato que você controla."' }),
      // ruling 2: o custo não usa o símbolo de virar: vale para artefatos que acabaram de chegar
      { ...mana('U', { text: 'Vire um artefato desvirado que você controla: Adicione {U}.' }), cost: [{ k: 'tapPermanents', n: 1, label: 'artefato desvirado', filter: (c, id) => isType(c.g, id, 'Artifact') }] },
      activated('{5}', function* (c) {
        shuffleLibrary(c.g, c.you);
        const topo = c.g.state.zones.library[c.you][0];
        if (topo === undefined) return;
        const [ex] = yield* exile(c.g, [topo]);
        // rulings 3 e 4: só neste turno e no tempo normal da carta; senão ela fica exilada
        if (ex !== null && ex !== undefined && c.g.state.objects[ex]?.zone === 'exile') allowPlay(c.g, c.you, c.source, [ex], { kind: 'endOfTurn' }, { free: true });
      }, { text: '{5}: Embaralhe o seu grimório e depois exile a carta do topo. Até o fim do turno, você pode jogar essa carta sem pagar o custo de mana.' }),
    ],
  }],
  rulings: {
    1: 'teste: ao entrar cria um Construct que recebe +1/+1 por artefato seu, contando a si mesmo',
    2: 'regra geral: CR 302.6 — o custo não tem o símbolo de virar: serve qualquer artefato desvirado, até criatura artefato recém-chegada (motor/costs.ts tapPermanents)',
    3: 'regra geral: CR 406.1 — se você não jogar a carta exilada, ela fica no exílio (motor/mecanicas.ts allowPlay)',
    4: 'regra geral: CR 601.3 — a permissão não muda o tempo: feitiço só na sua fase principal com a pilha vazia, terreno pela jogada de terreno (motor/priority.ts)',
    5: 'regra geral: CR 107.3b — sem pagar o custo de mana, o X do custo só pode ser 0 (motor/stack.ts)',
    6: 'regra geral: CR 118.9a — sem pagar o custo de mana não cabem custos alternativos; os adicionais continuam (motor/stack.ts)',
  },
});