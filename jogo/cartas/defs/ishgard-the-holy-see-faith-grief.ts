// Ishgard, the Holy See // Faith & Grief (aventureiro com face principal de terreno, CR 715)
// Ishgard, the Holy See — Land — Town
// This land enters tapped.
// {T}: Add {W}.
// Faith & Grief {3}{W}{W} — Sorcery — Adventure
// Return up to two target artifact and/or enchantment cards from your graveyard to your hand. (Then exile this card. You
// may play the land later from exile.)
import { defineCard, is, land, mana, or, returnToHand, t, tgtsAll, upTo } from '../../motor/api.ts';

// Conjurar a aventura, exilar ao resolver e jogar o terreno do exílio depois ficam no motor (motor/stack.ts,
// motor/priority.ts landPlayOptions, motor/formatos.ts; CR 715.3d, 305.1).
export default defineCard({
  name: 'Ishgard, the Holy See // Faith & Grief',
  faces: [
    {
      abilities: [land.tapped(), mana('W')],
    },
    {
      spell: {
        targets: [upTo(2, t.card('graveyard', or(is.artifact, is.enchantment), 'carta de artefato ou encantamento alvo do seu cemitério', 'you'))],
        *effect(c) {
          const ids = tgtsAll(c, 0);
          if (ids.length) yield* returnToHand(c.g, ids);
        },
      },
    },
  ],
  rulings: {
    1: 'teste: conjurada como aventura, é um feitiço branco de valor de mana 5',
    2: 'não se aplica: nenhuma carta dos decks copia uma permanente que tem aventura',
    3: 'teste: anulada, vai para o cemitério e não dá para jogar o terreno do exílio',
    4: 'teste: do exílio, o terreno só se joga na sua fase principal, com a pilha vazia e com uma jogada de terreno sobrando',
    5: 'regra geral: CR 205.3i — Town é um tipo de terreno sem regras próprias',
    6: 'não se aplica: nenhuma carta dos decks fala de carta "que tem uma Aventura"',
    7: 'teste: exilada de outro jeito, não dá permissão de jogar o terreno',
    8: 'não se aplica: nenhuma carta dos decks manda escolher um nome',
    9: 'teste: fora da pilha é um terreno incolor de valor de mana 0, e da mão se joga como terreno (não se conjura)',
    10: 'regra geral: CR 715.3a — só as características da aventura contam para conjurá-la (testes/regras-formatos.test.ts)',
    11: 'regra geral: CR 715.3 — conjurar como aventura não é custo alternativo: permissões e "sem pagar" valem para ela (testes/regras-formatos.test.ts)',
    12: 'regra geral: CR 707.10, 715.3c — a cópia da aventura deixa de existir ao resolver (motor/stack.ts)',
    13: 'não se aplica: nenhuma carta dos decks fala de carta "que tem uma Aventura"',
  },
});
