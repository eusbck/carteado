// Ishgard, the Holy See // Faith & Grief (aventureiro, CR 715)
// Ishgard, the Holy See — Land — Town
// This land enters tapped.
// {T}: Add {W}.
// Faith & Grief {3}{W}{W} — Sorcery — Adventure
// Return up to two target artifact and/or enchantment cards from your graveyard to your hand. (Then exile this card.
// You may play the land later from exile.)
import { defineCard, entersTapped, is, mana, moveObjects, or, t, tgtsAll, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Ishgard, the Holy See // Faith & Grief',
  faces: [
    { abilities: [entersTapped(), mana('W')] },
    {
      spell: {
        targets: [upTo(2, t.card('graveyard', or(is.artifact, is.enchantment), 'até duas cartas de artefato e/ou encantamento alvo do seu cemitério', 'you'))],
        *effect(c) {
          const ids = tgtsAll(c, 0);
          if (ids.length) yield* moveObjects(c.g, ids.map((id) => ({ id, to: 'hand' as const })), 'effect');
        },
      },
    },
  ],
  rulings: {
    1: 'regra geral: CR 715.3b — como aventura, só as características da aventura (motor/formatos.ts)',
    2: 'regra geral: CR 715.3 — a cópia de quem tem aventura também tem (motor/formatos.ts)',
    3: 'teste: a aventura devolve até dois artefatos/encantamentos e depois o terreno é jogado do exílio',
    4: 'regra geral: CR 715.3d — jogar o terreno do exílio segue o tempo de terreno (motor/priority.ts)',
    5: 'regra geral: CR 205.3i — Town é tipo de terreno sem significado próprio',
    6: 'regra geral: CR 715.4 — na pilha como aventura não "tem uma aventura" (motor/formatos.ts)',
    7: 'regra geral: CR 715.3d — exilada por outro motivo, não dá permissão (motor/stack.ts)',
    8: 'não se aplica: nenhuma carta dos decks pede para nomear',
    9: 'regra geral: CR 715.4 — fora da pilha só as características normais (motor/formatos.ts)',
    10: 'regra geral: CR 715.3b (motor/formatos.ts)',
    11: 'regra geral: CR 715.3a — conjurar como aventura não é custo alternativo (motor/stack.ts)',
    12: 'regra geral: CR 715.3e — cópia de aventura é exilada e deixa de existir (motor/stack.ts)',
    13: 'regra geral: CR 715.4 (motor/formatos.ts)',
  },
});
