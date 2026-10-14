// Righteous Valkyrie
// Flying
// Whenever another Angel or Cleric you control enters, you gain life equal to that creature's toughness.
// As long as you have at least 7 life more than your starting life total, creatures you control get +2/+2.
import { and, anthem, defineCard, gainLife, is, keyword, lkiChars, on, or, triggered } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Righteous Valkyrie',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && and(or(is.subtype('Angel'), is.subtype('Cleric')), is.yours, is.other)(c, e.obj) ? { criatura: e.obj } : false)), function* (c) {
        // ruling 1: a resistência na resolução, ou a última conhecida se ela saiu
        const r = lkiChars(c.g, c.event.criatura as ObjId)?.toughness ?? 0;
        if (r > 0) gainLife(c.g, c.you, r, c.source);
      }, { text: 'Sempre que outro Angel ou Cleric que você controla entra, você ganha vida igual à resistência dessa criatura.' }),
      { ...anthem(and(is.creature, is.yours), () => [{ k: 'pt', p: 2, t: 2 }], 'Enquanto você tiver pelo menos 7 pontos de vida a mais que o seu total inicial, as criaturas que você controla recebem +2/+2.'), condition: (c: SCtx) => c.g.state.players[c.you].life >= c.g.state.config.startingLife + 7 },
    ],
  }],
  rulings: {
    1: 'teste: ganha vida igual à resistência da criatura que entrou',
    2: 'teste: com 47 de vida (40 + 7), as suas criaturas recebem +2/+2; com 46, não',
  },
});
