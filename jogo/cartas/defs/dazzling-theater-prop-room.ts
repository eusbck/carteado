// Dazzling Theater // Prop Room (Sala: carta dividida com linha de tipo compartilhada, CR 709.5)
// Dazzling Theater {3}{W} — Enchantment — Room
// Creature spells you cast have convoke. (Your creatures can help cast those spells. Each creature you tap while
// casting a creature spell pays for {1} or one mana of that creature's color.)
// Prop Room {2}{W} — Enchantment — Room
// Untap each creature you control during each other player's untap step.
// (You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked
// door to unlock it.)
import { controllerOf, defineCard, isCreature, staticAbility } from '../../motor/api.ts';

// As portas: conjurar uma, entrar com ela destrancada, destrancar a outra (ação especial) e só valer o que está
// destrancado ficam no motor (motor/formatos.ts, priority.ts unlockDoor, chars.ts).
export default defineCard({
  name: 'Dazzling Theater // Prop Room',
  faces: [
    {
      abilities: [
        staticAbility({
          text: 'As mágicas de criatura que você conjura têm convocar.',
          // ruling 1: vale enquanto a porta estiver no campo e destrancada na hora de pagar (motor/stack.ts)
          rules: { spellsHaveConvoke: (c, jogador, _magica, ch) => jogador === c.you && ch.types.includes('Creature') },
        }),
      ],
    },
    {
      abilities: [
        staticAbility({
          text: 'Desvire cada criatura que você controla durante a etapa de desvirar de cada outro jogador.',
          rules: { untapDuringUntapOf: (c, id, ativo) => ativo !== c.you && controllerOf(c.g, id) === c.you && isCreature(c.g, id) },
        }),
      ],
    },
  ],
  rulings: {
    1: 'regra geral: CR 702.51a — convocar conferido ao pagar; sem a Sala, a mágica não tem convocar (motor/stack.ts)',
    2: 'teste: convoca com criatura que acabou de entrar',
    3: 'regra geral: CR 702.51a — convocar depois do custo total, sem mudar o valor de mana (motor/stack.ts)',
    4: 'regra geral: CR 702.51a — a criatura virada para mana não convoca de novo (motor/stack.ts)',
    5: 'teste: CR 709.5d — conjurar uma porta: ela entra destrancada; não dá para conjurar as duas',
    6: 'teste: CR 709.3b — na pilha só existe a porta conjurada',
    7: 'teste: CR 709.2 — a Sala é uma carta só',
    8: 'não se aplica: nenhuma carta dos decks manda escolher um nome',
    9: 'regra geral: CR 709.3a — só a porta conjurada conta para ver se pode ser conjurada (testes/regras-formatos.test.ts)',
    10: 'teste: CR 709.4 — fora da pilha e do campo tem as duas portas: valor de mana 7',
    11: 'teste: CR 709.5 — no campo, as características das portas destrancadas',
    12: 'regra geral: CR 707.10, 709.5b — a cópia da mágica fica com a porta escolhida (motor/stack.ts copySpell)',
    13: 'teste: CR 709.5d — vinda de fora da pilha, entra com as duas portas trancadas',
    14: 'teste: CR 709.5 — sem porta destrancada, não tem nome nem habilidades',
    15: 'teste: CR 116.2m, 709.5e — destrancar é ação especial, só como feitiço',
    16: 'não se aplica: nenhuma porta destas tem gatilho de destrancar (o motor gera o evento unlock, CR 709.5h)',
    17: 'não se aplica: nenhuma carta dos decks manda destrancar uma porta',
    18: 'não se aplica: nenhuma carta dos decks manda trancar uma porta',
    19: 'não se aplica: nenhuma porta destas tem gatilho de destrancar com alvo',
    20: 'não se aplica: nenhuma carta dos decks tem "sempre que você destrancar uma Sala por inteiro" (o evento tem full, CR 709.5i)',
    21: 'regra geral: CR 502.3 — só "durante a sua etapa de desvirar" não impede (gancho cantUntapDuringUntapOf recebe o jogador ativo)',
    22: 'teste: Prop Room desvira todas as suas criaturas na etapa de desvirar dos outros',
  },
});
