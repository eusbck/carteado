// Masterwork of Ingenuity
// You may have this Equipment enter as a copy of any Equipment on the battlefield.
import { defineCard, entersAsCopy, isSubtype } from '../../motor/api.ts';

export default defineCard({
  name: 'Masterwork of Ingenuity',
  faces: [{
    abilities: [
      // CR 707.5, 614.1c: só o que já está no campo
      entersAsCopy({
        label: 'Masterwork of Ingenuity', what: 'um Equipamento', text: 'Você pode fazer este Equipamento entrar como uma cópia de qualquer Equipamento no campo.',
        candidates: (c) => c.g.state.zones.battlefield.filter((id) => isSubtype(c.g, id, 'Equipment')),
      }),
    ],
  }],
  rulings: {
    1: 'teste: entra como cópia do Equipamento, sem estar anexado a nada',
  },
});
