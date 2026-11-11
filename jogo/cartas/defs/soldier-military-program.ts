// SOLDIER Military Program
// At the beginning of combat on your turn, choose one. If you control a commander, you may choose both instead.
// • Create a 1/1 white Soldier creature token.
// • Put a +1/+1 counter on each of up to two Soldiers you control.
import { addCounters, chooseItems, controlledBy, createTokens, defineCard, isSubtype, modal, nameOf, objItem, on, triggered, type G, type PlayerId } from '../../motor/api.ts';
import { ehComandante } from '../vingadores.ts';

/** "se você controla um comandante": qualquer comandante, não só o seu (ruling 2); ter mais de um não muda nada (ruling 1) */
const controlaUmComandante = (g: G, p: PlayerId): boolean => controlledBy(g, p, (id) => ehComandante(g, id)).length > 0;

export default defineCard({
  name: 'SOLDIER Military Program',
  faces: [{
    abilities: [
      // os modos são escolhidos quando o gatilho vai para a pilha (CR 603.3c); é aí que se olha o comandante
      triggered(on.beginCombat('you'), function* () { /* os modos fazem tudo */ }, {
        modes: modal(1, (c) => (controlaUmComandante(c.g, c.you) ? 2 : 1), [
          { text: 'Crie uma ficha de criatura Soldier 1/1 branca', *effect(c) { yield* createTokens(c.g, c.you, 'Soldier', 1); } },
          {
            text: 'Coloque um marcador +1/+1 em cada um de até dois Soldiers que você controla',
            *effect(c) {
              // sem alvo: escolhidos na resolução, entre os Soldiers de agora (inclusive a ficha do primeiro modo)
              const soldados = controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Soldier'));
              if (!soldados.length) return;
              const ids = soldados.length <= 2
                ? soldados.map(String)
                : yield* chooseItems(c.g, c.you, `${nameOf(c.g, c.source)}: escolha até dois Soldiers para receber um marcador +1/+1`, soldados.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 2);
              for (const id of ids.map(Number)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
            },
          },
        ]),
        text: 'No início do combate no seu turno, escolha um. Se você controlar um comandante, você pode escolher ambos em vez disso. • Crie uma ficha de criatura Soldier 1/1 branca. • Coloque um marcador +1/+1 em cada um de até dois Soldiers que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: controlando um comandante, escolhe os dois modos: cria a ficha e depois põe marcadores (no máximo dois modos, mesmo com dois comandantes)',
    2: 'teste: o comandante de outro jogador sob o seu controle também libera os dois modos',
  },
});
