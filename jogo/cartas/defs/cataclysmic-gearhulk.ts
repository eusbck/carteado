// Cataclysmic Gearhulk
// Vigilance
// When this creature enters, each player chooses an artifact, a creature, an enchantment, and a planeswalker from among
// the nonland permanents they control, then sacrifices the rest.
import { chooseItems, controlledBy, defineCard, etb, isLand, isType, keyword, nameOf, objItem, sacrifice } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const TIPOS: [string, string][] = [['Artifact', 'um artefato'], ['Creature', 'uma criatura'], ['Enchantment', 'um encantamento'], ['Planeswalker', 'um planeswalker']];

export default defineCard({
  name: 'Cataclysmic Gearhulk',
  faces: [{
    abilities: [
      keyword('vigilance'),
      etb(function* (c) {
        const s = c.g.state;
        const sacrificados: ObjId[] = [];
        // ruling 1: em ordem APNAP, cada um sabendo o que os anteriores escolheram; depois todos sacrificam juntos
        for (const p of c.g.apnap()) {
          if (s.players[p].left) continue;
          const naoTerrenos = controlledBy(c.g, p, (id) => !isLand(c.g, id));
          const fica = new Set<ObjId>();
          for (const [tipo, rotulo] of TIPOS) {
            const cands = naoTerrenos.filter((id) => isType(c.g, id, tipo));
            // ruling 5: sem permanente do tipo, segue para o próximo
            if (!cands.length) continue;
            // ruling 2: o mesmo permanente pode ser escolhido por mais de um tipo
            const [esc] = cands.length === 1 ? [String(cands[0])] : yield* chooseItems(c.g, p, `Cataclysmic Gearhulk: escolha ${rotulo} para manter`, cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
            fica.add(Number(esc));
          }
          // ruling 4: terrenos não são escolhidos nem sacrificados; ruling 3: ela mesma também pode ser sacrificada
          sacrificados.push(...naoTerrenos.filter((id) => !fica.has(id)));
        }
        if (sacrificados.length) yield* sacrifice(c.g, sacrificados);
      }, { text: 'Quando esta criatura entra, cada jogador escolhe um artefato, uma criatura, um encantamento e um planeswalker dentre as permanentes que não são terrenos que controla e depois sacrifica o resto.' }),
    ],
  }],
  rulings: {
    1: 'teste: cada jogador fica com um de cada tipo e sacrifica o resto; terrenos ficam',
    2: 'teste: cada jogador fica com um de cada tipo e sacrifica o resto; terrenos ficam',
    3: 'teste: cada jogador fica com um de cada tipo e sacrifica o resto; terrenos ficam',
    4: 'teste: cada jogador fica com um de cada tipo e sacrifica o resto; terrenos ficam',
    5: 'teste: cada jogador fica com um de cada tipo e sacrifica o resto; terrenos ficam',
  },
});
