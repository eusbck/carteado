// Nettlecyst
// Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)
// Equipped creature gets +1/+1 for each artifact and/or enchantment you control.
// Equip {2}
import { attach, attachedGets, createTokens, defineCard, equip, etb } from '../../motor/api.ts';
import { artifacts } from '../artefatos.ts';

export default defineCard({
  name: "Nettlecyst",
  faces: [{
    abilities: [
      etb(function*(c) { const [germ] = yield* createTokens(c.g, c.you, 'Phyrexian Germ', 1); if (germ !== undefined && c.g.state.objects[c.source]?.zone === 'battlefield') attach(c.g, c.source, germ); }, { kw: 'living weapon', text: 'Arma viva: cria um Phyrexian Germ preto 0/0 e anexa este Equipamento a ele.' }),
      attachedGets((c) => { const n = artifacts(c, true).length; return [{ k: 'pt', p: n, t: n }]; }, 'A criatura equipada recebe +1/+1 por artefato e/ou encantamento seu.'), equip('{2}'),
    ]
  }],
  rulings: {
    "1": "CR 702.92: usa a ficha atual Phyrexian Germ, não Germ.",
    "2": "teste: artefato encantamento conta uma única vez na seleção união.",
    "3": "CR 704.4: teste: Germe é criado 0/0, mas recebe Equipamento antes das ações de estado.",
    "4": "CR 704.5f: teste: reequipar deixa Germe com resistência zero; ficha morre e deixa de existir.",
    "5": "CR 301.5: destruir a criatura não destrói seu Equipamento.",
    "6": "CR 702.92: duplicação de fichas fora desta lista; arma viva anexa a uma ficha, as demais 0/0 morrem nas ações de estado."
  },
});
