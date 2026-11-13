// Carnivorous Cultivator // Enroot
// Carnivorous Cultivator — Deathtouch. This creature enters prepared. Whenever this creature deals combat damage to a
// player, return target land card from your graveyard to your hand.
// Enroot (feitiço preparado) {G} — Search your library for a land card, put it into your graveyard, then shuffle.
import { asEnters, defineCard, isLand, keyword, on, returnToHand, searchTo, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Carnivorous Cultivator // Enroot',
  faces: [
    {
      abilities: [
        keyword('deathtouch'),
        // CR 722.3a: "entra preparado"
        asEnters((_c, ev) => { ev.choices.prepared = true; }, 'Esta criatura entra preparada.'),
        triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
          const id = tgt(c);
          if (id !== null) yield* returnToHand(c.g, [id]);
        }, {
          targets: [t.card('graveyard', (c, id) => isLand(c.g, id), 'carta de terreno alvo do seu cemitério', 'you')],
          text: 'Sempre que esta criatura causa dano de combate a um jogador, devolva a carta de terreno alvo do seu cemitério para a sua mão.',
        }),
      ],
    },
    {
      spell: {
        *effect(c) {
          yield* searchTo(c, c.you, (id) => isLand(c.g, id), 1, 'graveyard', { prompt: 'Procure uma carta de terreno' });
        },
      },
    },
  ],
  rulings: {
    1: 'regra geral: CR 722.3a — a designação continua',
    2: 'regra geral: CR 722.3c — só o controlador atual (motor/priority.ts)',
    3: 'regra geral: CR 722.2b e 722.3a — preparado é designação do objeto, não valor copiável',
    4: 'regra geral: CR 722.3a — preparado é designação, não habilidade',
    5: 'regra geral: CR 722.3 — a carta é conjurada só pela frente',
    6: 'regra geral: CR 722.3b — sem a designação, a cópia no exílio deixa de existir (704.5e)',
    7: 'regra geral: CR 722.3c — exceção a 704.5e (motor/sba.ts)',
    8: 'regra geral: CR 608.2b — não resolve; a designação já saiu ao conjurar (601.2i)',
    9: 'regra geral: CR 722.4 — fora do campo, só as características normais',
    10: 'não se aplica: nenhuma carta dos decks desta frente pede para nomear uma carta',
    11: 'regra geral: CR 722.2b e 722.3a — preparado é designação do objeto, não valor copiável',
    12: 'teste: entra preparada; Enroot, conjurada do exílio, põe um terreno do grimório no cemitério',
    13: 'regra geral: CR 722.3c — conjura pela permissão, pagando o custo normal',
    14: 'regra geral: CR 722.3a — prepare() não age em quem já está preparado',
    15: 'regra geral: CR 722.3a — prepare() exige feitiço preparado',
  },
});
