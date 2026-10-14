// Curse of Opulence
// Enchant player
// Whenever enchanted player is attacked, create a Gold token. Each opponent attacking that player does the same. (A
// Gold token is an artifact with "Sacrifice this token: Add one mana of any color.")
import { controllerOf, createTokens, defineCard, on, t, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Curse of Opulence',
  faces: [{
    // CR 303.4b: a Aura encanta um jogador; o motor guarda quem em data.enchantedPlayer
    enchant: t.player(undefined, 'jogador'),
    abilities: [
      // rulings 2 e 4: uma vez por declaração, e só se o jogador (não um planeswalker dele) for atacado
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers') return false;
        const p = c.g.state.objects[c.source]?.data.enchantedPlayer;
        return typeof p === 'number' && e.attackers.some((a) => a.target.kind === 'player' && a.target.id === p) ? { jogador: p } : false;
      }), function* (c) {
        const alvo = c.event.jogador as PlayerId;
        yield* createTokens(c.g, c.you, 'Gold', 1);
        // ruling 3: quem ataca esse jogador agora, com criaturas ainda no combate
        const atacantes = new Set<PlayerId>();
        for (const a of c.g.state.combat?.attackers ?? []) {
          if (a.removed || a.target.kind !== 'player' || a.target.id !== alvo || !c.g.state.objects[a.id]) continue;
          atacantes.add(controllerOf(c.g, a.id));
        }
        for (const p of c.g.apnap()) if (atacantes.has(p) && c.g.isOpponent(c.you, p)) yield* createTokens(c.g, p, 'Gold', 1);
      }, { text: 'Sempre que o jogador encantado é atacado, crie uma ficha Gold. Cada oponente que esteja atacando esse jogador faz o mesmo.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 508.1h — os custos de ataque já foram pagos quando o gatilho resolve',
    2: 'teste: Bruno, encantado, é atacado por Carla: Ana (dona da maldição) e Carla criam uma ficha Gold cada',
    3: 'teste: sem atacantes no combate ao resolver, só quem controla a maldição cria a ficha',
    4: 'teste: atacar só um planeswalker do jogador encantado não dispara',
    5: 'teste: encantando a si mesma, ganha quando outro jogador ataca você',
  },
});
