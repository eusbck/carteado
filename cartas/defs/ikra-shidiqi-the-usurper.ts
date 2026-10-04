// Ikra Shidiqi, the Usurper
// Menace
// Whenever a creature you control deals combat damage to a player, you gain life equal to that creature's toughness.
// Partner
import { defineCard, gainLife, isCreature, keywords, lkiChars, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Ikra Shidiqi, the Usurper',
  faces: [{
    abilities: [
      ...keywords('menace', 'partner'),
      triggered(on.custom((e, c) => e.type === 'damage' && e.combat && e.target.kind === 'player' && e.controller === c.you && !!c.g.state.objects[e.source] && isCreature(c.g, e.source) ? { creature: e.source } : false), function* (c) {
        // ruling 5: resistência na resolução, ou como existiu por último no campo
        gainLife(c.g, c.you, Math.max(0, lkiChars(c.g, c.event.creature as ObjId)?.toughness ?? 0), c.source);
      }, { text: 'Sempre que uma criatura que você controla causa dano de combate a um jogador, você ganha vida igual à resistência dessa criatura.' }),
    ],
  }],
  rulings: {
    1: 'não se aplica: Ikra não é comandante em nenhum dos decks',
    2: 'não se aplica: Ikra não é comandante em nenhum dos decks',
    3: 'não se aplica: Ikra não é comandante em nenhum dos decks',
    4: 'não se aplica: Ikra não é comandante em nenhum dos decks',
    5: 'teste: a vida ganha é a resistência na resolução',
    6: 'não se aplica: Ikra não é comandante em nenhum dos decks',
    7: 'não se aplica: Ikra não é comandante em nenhum dos decks',
    8: 'não se aplica: Ikra não é comandante em nenhum dos decks',
  },
});
