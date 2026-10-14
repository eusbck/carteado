// Angelic Field Marshal
// Flying
// Lieutenant — As long as you control your commander, this creature gets +2/+2 and creatures you control have vigilance.
import { and, anthem, defineCard, is, keyword, selfGets } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import { controlaComandante } from '../wakanda.ts';

export default defineCard({
  name: 'Angelic Field Marshal',
  faces: [{
    abilities: [
      keyword('flying'),
      // rulings 1-4: vale enquanto você controlar o seu comandante (o de que você é dono), no campo
      { ...selfGets(() => [{ k: 'pt', p: 2, t: 2 }], 'Tenente — Enquanto você controlar o seu comandante, esta criatura recebe +2/+2.'), condition: (c: SCtx) => controlaComandante(c.g, c.you) },
      { ...anthem(and(is.creature, is.yours), () => [{ k: 'addKeyword', kw: 'vigilance' }], 'Tenente — Enquanto você controlar o seu comandante, as criaturas que você controla têm vigilância.'), condition: (c: SCtx) => controlaComandante(c.g, c.you) },
    ],
  }],
  rulings: {
    1: 'teste: sem o seu comandante no campo, nada muda',
    2: 'regra geral: só o seu comandante conta (cartas/wakanda.ts controlaComandante)',
    3: 'regra geral: quem controla esta criatura é quem precisa controlar o próprio comandante (cartas/wakanda.ts controlaComandante)',
    4: 'regra geral: CR 613 — a estática some na hora em que o comandante sai; o dano marcado pode virar letal',
    5: 'regra geral: CR 113.7a — um gatilho já na pilha resolve mesmo que a fonte perca a habilidade',
  },
});
