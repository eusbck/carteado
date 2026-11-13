// Elven Passage
// {T}, Pay 1 life, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield tapped, then
// shuffle. You may behold an Elf. If you do, untap that land. (To behold an Elf, choose an Elf you control or reveal an Elf
// card from your hand.)
import { activated, behold, defineCard, fetchBasicToBattlefield, isSubtype, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Elven Passage',
  faces: [{
    abilities: [
      activated('{T}, Pay 1 life, Sacrifice this land', function* (c) {
        const [terreno] = yield* fetchBasicToBattlefield(c, 1, { tapped: true, prompt: 'Procure uma carta de terreno básico' });
        // contemplar (CR 701.4a); rulings 1-3: revelar de novo vale; conta só a carta ou permanente Elf
        const elfo = yield* behold(c, (id) => isSubtype(c.g, id, 'Elf'), 'um Elf', { optional: true });
        if (elfo && terreno !== undefined && c.g.state.objects[terreno]?.zone === 'battlefield') untap(c.g, terreno);
      }, { text: '{T}, Pague 1 ponto de vida, Sacrifique este terreno: Procure uma carta de terreno básico, coloque-a no campo virada e embaralhe. Você pode contemplar um Elf. Se fizer isso, desvire esse terreno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.20 — uma carta já revelada pode ser revelada de novo (motor/conjurar-alternativo.ts behold)',
    2: 'regra geral: CR 701.4a — o que importa é ter contemplado, não o que acontece depois',
    3: 'regra geral: CR 205.3 — só cartas com o subtipo Elf (motor/conjurar-alternativo.ts behold)',
  },
});
