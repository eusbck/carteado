// Hellkite Tyrant
// Flying, trample
// Whenever this creature deals combat damage to a player, gain control of all artifacts that player controls.
// At the beginning of your upkeep, if you control twenty or more artifacts, you win the game.
import { controlledBy, defineCard, gainControl, isType, keywords, on, triggered, winGame } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const artefatos = (c: SCtx, p: number) => controlledBy(c.g, p, (id) => isType(c.g, id, 'Artifact'));

export default defineCard({
  name: 'Hellkite Tyrant',
  faces: [{
    abilities: [
      ...keywords('flying', 'trample'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const alvo = (c.event as { player?: number; target?: { id: number } }).player ?? (c.event as { target?: { id: number } }).target?.id;
        if (alvo === undefined) return;
        for (const id of artefatos(c, alvo)) gainControl(c.g, id, c.you, { kind: 'permanent' }, c.source);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, ganhe o controle de todos os artefatos que aquele jogador controla.' }),
      // CR 603.4: interveniente (ruling 1)
      triggered(on.upkeep('you'), function* (c) { winGame(c.g, c.you, 'Hellkite Tyrant: vinte ou mais artefatos'); }, {
        condition: (c) => artefatos(c, c.you).length >= 20,
        text: 'No início da sua manutenção, se você controlar vinte ou mais artefatos, você vence o jogo.',
      }),
    ],
  }],
  rulings: { 1: 'teste: ruling 1: com menos de vinte artefatos não dispara; com vinte, vence' },
});
