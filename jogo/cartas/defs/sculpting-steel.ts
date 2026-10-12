// Sculpting Steel
// You may have this artifact enter as a copy of any artifact on the battlefield.
import { defineCard, entersAsCopy, isType } from '../../motor/api.ts';

export default defineCard({
  name: 'Sculpting Steel',
  faces: [{
    abilities: [
      // CR 707.5: a cópia é escolhida ao entrar; ruling 4: pode não copiar nada
      entersAsCopy({
        label: 'Sculpting Steel', what: 'um artefato no campo',
        text: 'Você pode fazer este artefato entrar como uma cópia de qualquer artefato no campo de batalha.',
        candidates: (c) => c.g.state.zones.battlefield.filter((id) => isType(c.g, id, 'Artifact')),
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.2 — copia só os valores copiáveis: não copia estar virado, marcadores nem anexos (motor/criaturas.ts entersAsCopy)',
    2: 'regra geral: CR 707.3 — se o artefato escolhido é cópia de outra coisa, entra como o que ele copiou (motor/criaturas.ts entersAsCopy)',
    3: 'regra geral: CR 707.2 — copiando uma ficha, valem as características originais dela (motor/criaturas.ts entersAsCopy)',
    4: 'teste: pode entrar como cópia de qualquer artefato no campo, ou sem copiar nada',
    5: 'regra geral: CR 707.5 — as habilidades de entrar do artefato copiado valem para o Sculpting Steel (motor/actions.ts putOntoBattlefield)',
  },
});