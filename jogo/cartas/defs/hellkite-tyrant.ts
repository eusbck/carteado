// Hellkite Tyrant
// Flying, trample
// Whenever this creature deals combat damage to a player, gain control of all artifacts that player controls.
// At the beginning of your upkeep, if you control twenty or more artifacts, you win the game.
import { controlledBy, defineCard, gainControl, isType, keywords, on, triggered, winGame } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import type { PlayerId } from '../../motor/types.ts';

const vinteArtefatos = (c: SCtx) => controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')).length >= 20;

export default defineCard({
  name: 'Hellkite Tyrant',
  faces: [{
    abilities: [
      ...keywords('flying', 'trample'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const p = c.event.player as PlayerId;
        // os artefatos que o jogador controla na resolução (CR 608.2h); o efeito não acaba
        for (const id of controlledBy(c.g, p, (x) => isType(c.g, x, 'Artifact'))) gainControl(c.g, id, c.you, { kind: 'permanent' }, c.source);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, ganhe o controle de todos os artefatos que esse jogador controla.' }),
      triggered(on.upkeep('you'), function* (c) {
        winGame(c.g, c.you, 'Hellkite Tyrant: vinte ou mais artefatos');
      }, {
        // CR 603.4: condição interveniente, conferida ao disparar e de novo ao resolver (ruling 1)
        condition: vinteArtefatos,
        text: 'No início da sua manutenção, se você controla vinte ou mais artefatos, você vence o jogo.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: com menos de vinte artefatos ao resolver, o gatilho não faz nada',
  },
});
