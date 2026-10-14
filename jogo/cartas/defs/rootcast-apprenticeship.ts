// Rootcast Apprenticeship
// Choose three. You may choose the same mode more than once.
// • Put two +1/+1 counters on target creature.
// • Create a token that's a copy of target token you control.
// • Target player creates a 1/1 green Squirrel creature token.
// • Target opponent sacrifices a nontoken artifact of their choice.
import {
  addCounters, and, copiableValues, createTokens, defineCard, eachSacrifices, is, isType, modal, t, tgt, tgtPlayer,
} from '../../motor/api.ts';

export default defineCard({
  name: 'Rootcast Apprenticeship',
  faces: [{
    spell: {
      // CR 700.2d: três modos, podendo repetir; a ordem de resolução é a dos modos escritos (ruling 3)
      modes: modal(3, 3, [
        {
          text: 'Coloque dois marcadores +1/+1 na criatura alvo', targets: [t.creature()],
          *effect(c) { const id = tgt(c); if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 2, c.you); },
        },
        {
          text: 'Crie uma ficha que é uma cópia da ficha alvo que você controla', targets: [t.permanent(and(is.token, is.yours), 'ficha alvo que você controla')],
          *effect(c) { const id = tgt(c); if (id !== null) yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, 1); },
        },
        {
          text: 'O jogador alvo cria uma ficha de criatura Squirrel verde 1/1', targets: [t.player()],
          *effect(c) { const p = tgtPlayer(c); if (p !== null) yield* createTokens(c.g, p, 'Squirrel', 1); },
        },
        {
          text: 'O oponente alvo sacrifica um artefato que não é ficha à escolha dele', targets: [t.opponent()],
          *effect(c) {
            const p = tgtPlayer(c);
            if (p !== null) yield* eachSacrifices(c, [p], (id) => isType(c.g, id, 'Artifact') && !c.g.state.objects[id].isToken, 1, 'um artefato que não é ficha');
          },
        },
      ], { repeat: true }),
    },
  }],
  rulings: {
    1: 'regra geral: CR 700.2 — os modos são escolhidos ao conjurar',
    2: 'teste: três vezes o mesmo modo: seis marcadores na criatura alvo',
    3: 'teste: modos diferentes: Squirrel para o jogador alvo, cópia da ficha e sacrifício do oponente',
    4: 'regra geral: CR 700.2d — com o mesmo modo repetido, a ordem é a da escolha',
    5: 'regra geral: CR 608.2 — os gatilhos esperam a mágica terminar de resolver',
    6: 'regra geral: CR 707.10 — a cópia mantém os modos',
    7: 'regra geral: CR 608.2b — com todos os alvos ilegais a mágica não resolve; com algum legal, resolve só para os legais',
  },
});
