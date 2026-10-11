// Fell the Profane // Fell Mire (modal de duas faces)
// Fell the Profane {2}{B}{B} — Instant
// Destroy target creature or planeswalker.
// Fell Mire — Land
// As this land enters, you may pay 3 life. If you don't, it enters tapped.
// {T}: Add {B}.
import { defineCard, destroy, land, mana, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Fell the Profane // Fell Mire',
  faces: [
    {
      spell: {
        targets: [t.creatureOrPlaneswalker()],
        *effect(c) {
          const id = tgt(c);
          if (id !== null) yield* destroy(c.g, [id]);
        },
      },
    },
    { abilities: [land.payLifeOrTapped(3), mana('B')] },
  ],
  rulings: {
    1: 'teste: CR 712.11c — conjurar ou jogar olha só a face escolhida',
    2: 'regra geral: CR 712.12 — permissão de jogar oferece as duas faces; de conjurar, só a de mágica (testes/regras-formatos.test.ts)',
    3: 'regra geral: CR 712.12 — a face que se encaixa no efeito (testes/regras-formatos.test.ts)',
    4: 'regra geral: CR 712.8a, 712.14 — fora do campo só a frente; posta no campo, entra com a frente (testes/regras-formatos.test.ts)',
    5: 'regra geral: CR 712.8a, 712.8f — valor de mana da face considerada (testes/regras-formatos.test.ts)',
    6: 'regra geral: CR 712.3, 712.9 — só transforma quando uma habilidade manda (testes/regras-formatos.test.ts)',
  },
});
