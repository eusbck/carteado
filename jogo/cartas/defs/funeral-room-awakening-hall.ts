// Funeral Room // Awakening Hall (Sala: carta dividida com linha de tipo compartilhada, CR 709.5)
// Funeral Room {2}{B} — Enchantment — Room
// Whenever a creature you control dies, each opponent loses 1 life and you gain 1 life.
// Awakening Hall {6}{B}{B} — Enchantment — Room
// When you unlock this door, return all creature cards from your graveyard to the battlefield.
// (You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked
// door to unlock it.)
import { defineCard, gainLife, isCreature, loseLife, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import { aoDestrancar } from '../milagres.ts';

export default defineCard({
  name: 'Funeral Room // Awakening Hall',
  faces: [
    {
      abilities: [
        // ruling 1: a Sala saindo junto com as criaturas ainda dispara (olha para trás, CR 603.10a)
        triggered(on.dies((c, lki) => lki.controller === c.you), function* (c) {
          for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
          gainLife(c.g, c.you, 1, c.source);
        }, { text: 'Sempre que uma criatura que você controla morre, cada oponente perde 1 de vida e você ganha 1 de vida.' }),
      ],
    },
    {
      abilities: [
        triggered(aoDestrancar(1), function* (c) {
          const cartas = c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id));
          if (cartas.length) yield* putOntoBattlefield(c.g, cartas.map((id) => ({ id, controller: c.you })), 'effect');
        }, { text: 'Quando você destrancar esta porta, devolva todas as cartas de criatura do seu cemitério para o campo de batalha.' }),
      ],
    },
  ],
  rulings: {
    1: 'teste: Funeral Room: cada criatura sua que morre drena 1 de cada oponente',
    2: 'regra geral: CR 709.5 — conjura-se uma porta só (motor/formatos.ts)',
    3: 'regra geral: CR 709.5 — a porta não conjurada é ignorada na pilha (motor/formatos.ts)',
    4: 'regra geral: CR 709.5 — a Sala é uma carta só (motor/formatos.ts)',
    5: 'regra geral: CR 709.5 — dois nomes; escolhe-se um (motor/formatos.ts)',
    6: 'regra geral: CR 709.5 — "conjurar com tais características" olha só a porta conjurada (motor/formatos.ts)',
    7: 'regra geral: CR 709.5 — fora da pilha e do campo, as duas portas combinadas (motor/formatos.ts)',
    8: 'regra geral: CR 709.5 — no campo, as portas destrancadas (motor/formatos.ts)',
    9: 'regra geral: CR 707.10 — cópia da mágica de Sala guarda a porta escolhida (motor/formatos.ts)',
    10: 'regra geral: CR 709.5 — entrando sem ser conjurada, as duas portas trancadas (motor/formatos.ts)',
    11: 'regra geral: CR 709.5 — sem porta destrancada, sem nome nem habilidades (motor/formatos.ts)',
    12: 'teste: destrancar Awakening Hall devolve todas as cartas de criatura do seu cemitério',
    13: 'teste: destrancar Awakening Hall devolve todas as cartas de criatura do seu cemitério',
    14: 'não se aplica: nenhuma carta dos decks destranca portas por habilidade',
    15: 'não se aplica: nenhuma carta dos decks tranca portas',
    16: 'regra geral: CR 603.3d — sem alvos, o gatilho de destrancar não precisa deles (Awakening Hall não tem alvo)',
    17: 'não se aplica: nenhuma carta dos decks diz "destrancar completamente"',
  },
});
