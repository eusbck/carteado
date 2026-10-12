// Lita, Little Orphan Amphibian
// Alliance — Whenever another creature you control enters, choose one that hasn't been chosen this turn.
// • Put a +1/+1 counter on Lita.
// • Create a Food token. (It's an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")
// • Scry 1.
import { addCounters, and, chooseItems, createTokens, defineCard, is, lookAndArrange, on, triggered } from '../../motor/api.ts';
import { COMIDA } from '../tartarugas.ts';

const MODOS = ['Coloque um marcador +1/+1 em Lita', 'Crie uma ficha Food', 'Vidência 1'];

export default defineCard({
  name: 'Lita, Little Orphan Amphibian',
  faces: [{
    abilities: [
      // Simplificação: o modo é escolhido ao resolver, e não ao ir para a pilha (nenhum modo tem alvo). Os modos já
      // escolhidos no turno ficam guardados em cada Lita (ruling 1); sem modo livre, nada acontece (ruling 5)
      triggered(on.enters(and(is.creature, is.yours, is.other)), function* (c) {
        const o = c.g.state.objects[c.source];
        if (!o || o.zone !== 'battlefield') return;
        const turno = c.g.state.turn.number;
        const livres = MODOS.map((_, i) => i).filter((i) => o.usedThisTurn[`lita:${i}`] !== turno);
        if (!livres.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Lita: escolha um modo que ainda não foi escolhido neste turno', livres.map((i) => ({ id: String(i), label: MODOS[i] })), 1, 1);
        const modo = Number(esc);
        o.usedThisTurn[`lita:${modo}`] = turno;
        c.g.bump();
        if (modo === 0) addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
        else if (modo === 1) yield* createTokens(c.g, c.you, 'Food', 1);
        else yield* lookAndArrange(c.g, c.you, 1, 'scry');
      }, { text: 'Aliança — Sempre que outra criatura que você controla entra, escolha um que não tenha sido escolhido neste turno: coloque um marcador +1/+1 em Lita; ou crie uma ficha Food; ou vidência 1.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: os modos já escolhidos no turno ficam guardados em cada Lita (GameObject.usedThisTurn, cartas/defs/lita-little-orphan-amphibian.ts)',
    2: 'teste: cada disparo no turno escolhe um modo diferente; no quarto, nada acontece',
    3: 'regra geral: CR 603.6a — as permanentes que entram juntas veem umas às outras entrar (motor/triggers.ts)',
    4: COMIDA.naoComa,
    5: 'teste: cada disparo no turno escolhe um modo diferente; no quarto, nada acontece',
    6: COMIDA.tipo,
    7: COMIDA.alvos,
    8: COMIDA.qualquer,
  },
});