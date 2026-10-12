// Photon, Mighty Marvel
// Flying
// Whenever Photon deals combat damage to a player, add that much mana of any one color. Until end of turn, you don't lose
// this mana as steps and phases end.
import { addMana, chooseItems, defineCard, keyword, on, triggered } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

const CORES: [ManaType, string][] = [['W', 'Branco'], ['U', 'Azul'], ['B', 'Preto'], ['R', 'Vermelho'], ['G', 'Verde']];

export default defineCard({
  name: 'Photon, Mighty Marvel',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const n = Number(c.event.amount ?? 0);
        if (n <= 0) return;
        const [cor] = yield* chooseItems(c.g, c.you, `Photon: ${n} mana(s) de qual cor?`, CORES.map(([id, label]) => ({ id, label })), 1, 1);
        addMana(c.g, c.you, Array(n).fill(cor as ManaType), { source: c.source, untilEndOfTurn: true });
      }, { text: 'Sempre que Photon causa dano de combate a um jogador, adicione essa quantidade de mana de uma cor qualquer. Até o fim do turno, você não perde essa mana quando etapas e fases terminam.' }),
    ],
  }],
  rulings: {},
});