// Carnivorous Cultivator // Enroot
// Carnivorous Cultivator — Deathtouch. This creature enters prepared. Whenever this creature deals combat damage to a
// player, return target land card from your graveyard to your hand.
// Enroot (feitiço preparado) — Search your library for a land card, put it into your graveyard, then shuffle.
import { asEnters, defineCard, is, isLand, keyword, moveObjects, on, searchTo, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Carnivorous Cultivator // Enroot',
  faces: [
    {
      abilities: [
        keyword('deathtouch'),
        asEnters((_c, ev) => { ev.choices.prepared = true; }, 'Esta criatura entra preparada.'),
        triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
          const id = tgt(c);
          if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
        }, { targets: [t.card('graveyard', is.land, 'carta de terreno alvo do seu cemitério')], text: 'Sempre que esta criatura causa dano de combate a um jogador, devolva a carta de terreno alvo do seu cemitério para a sua mão.' }),
      ],
    },
    { spell: { *effect(c) { yield* searchTo(c, c.you, (id) => isLand(c.g, id), 1, 'graveyard', { prompt: 'Procure uma carta de terreno para o cemitério' }); } } },
  ],
  rulings: {
    1: 'regra geral: CR 722.3a — entra preparada: pode conjurar uma cópia de Enroot do exílio',
    2: 'regra geral: CR 722.3c — conjurar a cópia tira a designação de preparada',
  },
});
