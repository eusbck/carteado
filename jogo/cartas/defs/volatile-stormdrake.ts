// Volatile Stormdrake
// Flying, hexproof from activated and triggered abilities
// When this creature enters, exchange control of this creature and target creature an opponent controls. If you do, you
// get {E}{E}{E}{E}, then sacrifice that creature unless you pay an amount of {E} equal to its mana value.
import { defineCard, etb, exchangeControl, getEnergy, HEXPROOF_FROM_ABILITIES, is, keyword, manaValue, mayPayEnergy, sacrifice, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Volatile Stormdrake',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 702.11d (motor/controle.ts): habilidades ativadas e desencadeadas dos oponentes não o miram (ruling 1)
      { ...keyword(HEXPROOF_FROM_ABILITIES), text: 'resistência a magia contra habilidades ativadas e desencadeadas' },
      etb(function* (c) {
        const alvo = tgt(c);
        // ruling 3: este no campo e o alvo legal, senão nada acontece; ruling 2: a troca não tem duração
        if (alvo === null || !exchangeControl(c.g, c.source, alvo, c.source)) return;
        getEnergy(c.g, c.you, 4);
        // ruling 10: paga uma vez, a quantidade igual ao valor de mana da criatura ganha
        const n = manaValue(c.g, alvo);
        const pagou = yield* mayPayEnergy(c.g, c.you, n, 'ficar com a criatura ganha (Volatile Stormdrake)');
        if (!pagou && c.g.state.objects[alvo]?.zone === 'battlefield') yield* sacrifice(c.g, [alvo]);
      }, {
        targets: [t.creature(is.opponents, 'criatura alvo que um oponente controla')],
        text: 'Quando esta criatura entra, troque o controle dela e da criatura alvo que um oponente controla. Se fizer isso, você recebe {E}{E}{E}{E} e depois sacrifica essa criatura a menos que pague uma quantidade de {E} igual ao valor de mana dela.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a habilidade ativada de um oponente não pode mirá-lo; a mágica pode',
    2: 'teste: a troca continua depois que ele sai do campo',
    3: 'teste: se ele saiu do campo antes de resolver, nada acontece',
    4: 'regra geral: CR 800.4a — quem sai da partida leva o que tem; o controle dado por ele acaba (motor/sba.ts)',
    5: 'regra geral: CR 107.14 — {E} é um marcador de energia (motor/controle.ts)',
    6: 'regra geral: CR 122.1 — marcadores de energia ficam no jogador (motor/controle.ts)',
    7: 'não se aplica: a mesa mostra a energia de cada jogador',
    8: 'teste: paga a energia igual ao valor de mana para ficar com a criatura; sem energia suficiente, sacrifica',
    9: 'regra geral: CR 107.14 — energia não é mana e não some entre etapas (motor/controle.ts)',
    10: 'teste: paga a energia igual ao valor de mana para ficar com a criatura; sem energia suficiente, sacrifica',
    11: 'regra geral: CR 608.2c — ninguém age entre pagar e o resto do efeito (motor/stack.ts)',
    12: 'regra geral: CR 608.2b — com o alvo ilegal, a habilidade não resolve e não há energia (motor/stack.ts)',
    13: 'regra geral: CR 608.2b — com o alvo ilegal, a habilidade não resolve e não há energia (motor/stack.ts)',
  },
});
