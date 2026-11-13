// Ishgard, the Holy See // Faith & Grief (aventureiro, CR 715)
// Ishgard, the Holy See — Land — Town
// This land enters tapped.
// {T}: Add {W}.
// Faith & Grief {3}{W}{W} — Sorcery — Adventure
// Return up to two target artifact and/or enchantment cards from your graveyard to your hand. (Then exile this card.
// You may play the land later from exile.)
import { defineCard, is, land, mana, moveObjects, or, t, tgtsAll, upTo } from '../../motor/api.ts';
import type { ZoneName } from '../../motor/types.ts';

// A carta é um terreno: não se conjura (CR 305.9); a aventura vai para o exílio ao resolver e, de lá, o terreno pode ser
// jogado com as regras normais de jogar terreno (motor/priority.ts, lote3-a; CR 715.3d).
export default defineCard({
  name: 'Ishgard, the Holy See // Faith & Grief',
  faces: [
    { abilities: [land.tapped(), mana('W')] },
    {
      spell: {
        targets: [upTo(2, t.card('graveyard', or(is.artifact, is.enchantment), 'até duas cartas de artefato e/ou encantamento alvo do seu cemitério', 'you'))],
        *effect(c) {
          const ids = tgtsAll(c, 0);
          if (ids.length) yield* moveObjects(c.g, ids.map((id) => ({ id, to: 'hand' as ZoneName })), 'effect');
        },
      },
    },
  ],
  rulings: {
    1: 'teste: CR 715.3b — conjurada como aventura, só as características da aventura',
    2: 'não se aplica: nenhuma carta dos decks copia um terreno com aventura',
    3: 'teste: CR 715.3d — resolvida, vai para o exílio e o terreno pode ser jogado de lá',
    4: 'teste: do exílio, só como a jogada de terreno do turno, na sua fase principal',
    5: 'teste: Town é um tipo de terreno sem regras próprias (CR 205.3i)',
    6: 'regra geral: CR 715.4 — fora da pilha, só as características normais (motor/chars.ts)',
    7: 'regra geral: CR 715.3d — exilada de outro jeito, não dá permissão de jogar (motor/priority.ts adventureOf)',
    8: 'não se aplica: nenhuma carta dos decks pede para nomear uma carta',
    9: 'teste: CR 715.4 — no cemitério e na mão é só um terreno de valor de mana 0',
    10: 'regra geral: CR 715.3a — só as características da aventura contam para conjurá-la (testes/regras-formatos.test.ts)',
    11: 'regra geral: CR 715.3 — conjurar como aventura não é custo alternativo (testes/regras-formatos.test.ts)',
    12: 'regra geral: CR 715.3d, 707.10 — a cópia de uma aventura é exilada e deixa de existir (motor/stack.ts)',
    13: 'não se aplica: nenhuma carta dos decks pergunta se algo "tem uma aventura"',
  },
});
