// Heartwood Crafter // Soul Tether
// Heartwood Crafter — This creature enters prepared. {T}: Add {C}. This mana can't be spent to cast spells from your hand.
// Soul Tether (feitiço preparado) — Create a Heartwood token.
import { asEnters, createTokens, defineCard, defineFn, mana, type G } from '../../motor/api.ts';

const RESTRICAO = 'Heartwood Crafter:naoDaMao';
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) => {
  if (purpose.kind !== 'spell' || purpose.obj === undefined) return true;
  return g.state.objects[purpose.obj]?.stack?.castFrom !== 'hand';
});

export default defineCard({
  name: 'Heartwood Crafter // Soul Tether',
  faces: [
    {
      abilities: [
        // CR 722.3a
        asEnters((_c, ev) => { ev.choices.prepared = true; }, 'Esta criatura entra preparada.'),
        mana('C', { restriction: RESTRICAO, text: '{T}: Adicione {C}. Essa mana não pode ser gasta para conjurar mágicas da sua mão.' }),
      ],
    },
    { spell: { *effect(c) { yield* createTokens(c.g, c.you, 'Heartwood', 1); } } },
  ],
  rulings: {
    1: 'regra geral: CR 722.3a — entra preparada: pode conjurar uma cópia de Soul Tether do exílio',
    2: 'regra geral: CR 722.3c — conjurar a cópia tira a designação de preparada',
    3: 'regra geral: CR 106.6 — a mana pode pagar habilidades e a cópia preparada (não vem da mão)',
  },
});
