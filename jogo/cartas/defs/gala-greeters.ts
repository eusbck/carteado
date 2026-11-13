// Gala Greeters
// Alliance — Whenever another creature you control enters, choose one that hasn't been chosen this turn —
// • Put a +1/+1 counter on this creature.
// • Create a tapped Treasure token.
// • You gain 2 life.
import { addCounters, and, chooseItems, createTokens, defineCard, gainLife, is, on, triggered } from '../../motor/api.ts';

const MODOS = ['Coloque um marcador +1/+1 nesta criatura', 'Crie uma ficha de Treasure virada', 'Você ganha 2 pontos de vida'];

export default defineCard({
  name: 'Gala Greeters',
  faces: [{
    abilities: [
      // Como em Lita, Little Orphan Amphibian: nenhum modo tem alvo e o modo é escolhido ao resolver; os já escolhidos no
      // turno ficam em usedThisTurn; sem modo livre, nada acontece
      triggered(on.enters(and(is.creature, is.yours, is.other)), function* (c) {
        const o = c.g.state.objects[c.source];
        if (!o) return;
        const turno = c.g.state.turn.number;
        const livres = MODOS.map((_, i) => i).filter((i) => o.usedThisTurn[`gala:${i}`] !== turno);
        if (!livres.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Gala Greeters: escolha um modo que ainda não foi escolhido neste turno', livres.map((i) => ({ id: String(i), label: MODOS[i] })), 1, 1);
        const modo = Number(esc);
        o.usedThisTurn[`gala:${modo}`] = turno;
        c.g.bump();
        if (modo === 0) { if (o.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you); }
        else if (modo === 1) yield* createTokens(c.g, c.you, 'Treasure', 1, { tapped: true });
        else gainLife(c.g, c.you, 2, c.source);
      }, { text: 'Aliança — Sempre que outra criatura que você controla entra, escolha um que não tenha sido escolhido neste turno: coloque um marcador +1/+1 nesta criatura; ou crie uma ficha de Treasure virada; ou você ganha 2 pontos de vida.' }),
    ],
  }],
  rulings: {
    1: 'teste: cada disparo no turno escolhe um modo diferente; no quarto, nada acontece',
  },
});
