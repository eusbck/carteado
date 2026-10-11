// Agadeem's Awakening // Agadeem, the Undercrypt (modal de duas faces)
// Agadeem's Awakening {X}{B}{B}{B} — Sorcery
// Return from your graveyard to the battlefield any number of target creature cards that each have a different mana
// value X or less.
// Agadeem, the Undercrypt — Land
// As this land enters, you may pay 3 life. If you don't, it enters tapped.
// {T}: Add {B}.
import { defineCard, is, land, mana, manaValue, putOntoBattlefield, t, type ObjId } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

/** o X da mágica (na pilha enquanto é conjurada e quando resolve) */
const xDaMagica = (c: SCtx) => c.g.state.objects[c.source]?.stack?.x ?? 0;

export default defineCard({
  name: "Agadeem's Awakening // Agadeem, the Undercrypt",
  faces: [
    {
      spell: {
        targets: [{
          ...t.card('graveyard', (c, id) => is.creature(c, id) && manaValue(c.g, id) <= xDaMagica(c), 'cartas de criatura alvo do seu cemitério, cada uma com valor de mana diferente, X ou menos'),
          min: 0, max: 99,
          // valores de mana diferentes entre si (ruling 1): X = 3 permite até quatro alvos (3, 2, 1 e 0)
          validateSet: (c, alvos) => {
            const mvs = alvos.map((r) => (r.kind === 'obj' && c.g.state.objects[r.id] ? manaValue(c.g, r.id) : -1));
            return new Set(mvs).size === mvs.length;
          },
        }],
        *effect(c) {
          const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'graveyard' ? [r.id as ObjId] : []));
          if (ids.length) yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you })), 'effect');
        },
      },
    },
    { abilities: [land.payLifeOrTapped(3), mana('B')] },
  ],
  rulings: {
    1: 'teste: com X = 3 volta uma criatura de cada valor de mana, nunca duas do mesmo',
    2: 'teste: com X = 0 só cabe carta de criatura de valor de mana 0',
    3: 'regra geral: CR 202.3e — {X} vale 0 fora da pilha (motor/chars.ts)',
    4: 'não se aplica: marcas de face impressas não têm efeito no jogo (CR 712.3a-b)',
    5: 'teste: CR 712.11c — conjurar ou jogar olha só a face escolhida',
    6: 'regra geral: CR 712.12 — permissão de jogar oferece as duas faces; de conjurar, só as de mágica (testes/regras-formatos.test.ts)',
    7: 'regra geral: CR 712.12 — a face que se encaixa no efeito (testes/regras-formatos.test.ts)',
    8: 'teste: CR 712.8a — fora da pilha e do campo vale o valor de mana da frente',
    9: 'regra geral: CR 712.14 — só se transforma com uma habilidade que mande (testes/regras-formatos.test.ts)',
    10: 'teste: CR 712.14 — posta no campo por efeito, só a frente; a frente sendo feitiço, fica onde está',
    11: 'não se aplica: nenhuma carta dos decks manda escolher um nome',
    12: 'regra geral: CR 903.4d — a identidade de cor soma as duas faces (gerado/cartas.json, motor/deck.ts)',
  },
});
