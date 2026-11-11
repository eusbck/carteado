// Phyrexian Metamorph
// ({U/P} can be paid with either {U} or 2 life.)
// You may have this creature enter as a copy of any artifact or creature on the battlefield, except it's an artifact in
// addition to its other types.
import { defineCard, entersAsCopy, isCreature, isType } from '../../motor/api.ts';

export default defineCard({
  name: 'Phyrexian Metamorph',
  faces: [{
    abilities: [
      entersAsCopy({
        label: 'Phyrexian Metamorph', what: 'um artefato ou criatura no campo',
        text: 'Você pode fazer esta criatura entrar como uma cópia de qualquer artefato ou criatura no campo, exceto que ela é um artefato além dos outros tipos.',
        // ruling 3: só o que já está no campo (CR 614.12)
        candidates: (c) => c.g.state.zones.battlefield.filter((id) => isCreature(c.g, id) || isType(c.g, id, 'Artifact')),
        // CR 707.9b: "é um artefato além dos outros tipos" vira valor copiável
        except: () => ({ addTypes: ['Artifact'] }),
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 107.3 — X do custo do modelo vale 0 no campo',
    2: 'regra geral: CR 707.2 — copia os valores originais da ficha e não vira ficha (motor/mecanicas.ts copiableValues)',
    3: 'regra geral: CR 614.12 — só o que já está no campo pode ser escolhido (motor/criaturas.ts entersAsCopy)',
    4: 'teste: copiando um artefato que não é criatura, deixa de ser criatura',
    5: 'regra geral: CR 707.3 — copia o que o modelo estiver copiando (motor/mecanicas.ts copiableValues)',
    6: 'regra geral: CR 707.5 — as habilidades de entrar e os "ao entrar" do modelo funcionam (motor/criaturas.ts entersAsCopy)',
    7: 'teste: copia uma criatura e é artefato além dos tipos dela, sem marcadores',
    8: 'teste: sem copiar nada, entra como 0/0 e morre',
  },
});
