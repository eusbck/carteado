// Witch Enchanter // Witch-Blessed Meadow (modal de duas faces)
// Witch Enchanter {3}{W} — Creature — Human Warlock 2/2
// When this creature enters, destroy target artifact or enchantment an opponent controls.
// Witch-Blessed Meadow — Land
// As this land enters, you may pay 3 life. If you don't, it enters tapped.
// {T}: Add {W}.
import { defineCard, destroy, etb, is, land, mana, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Witch Enchanter // Witch-Blessed Meadow',
  faces: [
    {
      abilities: [
        etb(function* (c) {
          const id = tgt(c);
          if (id !== null) yield* destroy(c.g, [id]);
        }, {
          targets: [t.permanent((c, id) => or(is.artifact, is.enchantment)(c, id) && is.opponents(c, id), 'artefato ou encantamento alvo que um oponente controla')],
          text: 'Quando esta criatura entra, destrua o artefato ou encantamento alvo que um oponente controla.',
        }),
      ],
    },
    { abilities: [land.payLifeOrTapped(3), mana('W')] },
  ],
  rulings: {
    1: 'teste: CR 712.11c — impedido de conjurar criaturas, ainda joga o terreno',
    2: 'regra geral: CR 712.12 — permissão de jogar oferece as duas faces; de conjurar, só a de mágica (testes/regras-formatos.test.ts)',
    3: 'regra geral: CR 712.12 — a face que se encaixa no efeito (testes/regras-formatos.test.ts)',
    4: 'teste: CR 712.8a — no cemitério é só uma carta de criatura, não de terreno',
    5: 'regra geral: CR 712.8a, 712.8f — valor de mana da face considerada (testes/regras-formatos.test.ts)',
    6: 'regra geral: CR 712.3, 712.9 — só transforma quando uma habilidade manda (testes/regras-formatos.test.ts)',
  },
});
