// Anya, Merciless Angel
// Flying
// Anya gets +3/+3 for each opponent whose life total is less than half their starting life total.
// As long as an opponent's life total is less than half their starting life total, Anya has indestructible.
import { defineCard, keywords, selfGets } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

/** oponentes com menos da metade da vida inicial (ruling 3: com vida inicial ímpar, a metade pode ser fracionária) */
function abaixoDaMetade(c: SCtx): number {
  const inicial = c.g.state.config.startingLife;
  return c.g.opponents(c.you).filter((p) => !c.g.state.players[p].left && c.g.state.players[p].life * 2 < inicial).length;
}

export default defineCard({
  name: 'Anya, Merciless Angel',
  faces: [{
    abilities: [
      ...keywords('flying'),
      selfGets((c) => { const n = abaixoDaMetade(c); return n > 0 ? [{ k: 'pt', p: 3 * n, t: 3 * n }] : []; },
        'Anya recebe +3/+3 para cada oponente cujo total de vida seja menor que metade do total de vida inicial dele.'),
      selfGets(() => [{ k: 'addKeyword', kw: 'indestructible' }],
        'Enquanto o total de vida de um oponente for menor que metade do total de vida inicial dele, Anya tem indestrutível.',
        { condition: (c) => abaixoDaMetade(c) > 0 }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 120.6, 704.5g — o dano fica marcado mesmo indestrutível; perdendo indestrutível, morre na próxima verificação',
    2: 'regra geral: CR 704.3 — as características são conferidas quando as ações de estado são verificadas, depois do dano simultâneo',
    3: 'teste: com 20 de vida (vida inicial 40) não conta; com 19 conta: +3/+3 e indestrutível',
  },
});
