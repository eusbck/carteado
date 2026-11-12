// Shifting Woodland
// This land enters tapped unless you control a Forest.
// {T}: Add {G}.
// Delirium — {2}{G}{G}: This land becomes a copy of target permanent card in your graveyard until end of turn. Activate
// only if there are four or more card types among cards in your graveyard.
import { activated, becomeCopy, defineCard, isPermanentCard, land, mana, t, tgt } from '../../motor/api.ts';
import { tiposNoCemiterio } from '../terras.ts';

export default defineCard({
  name: 'Shifting Woodland',
  faces: [{
    abilities: [
      // ruling 1: confere ao entrar; uma Forest que entra junto não conta
      land.tappedUnlessControl('Forest'),
      mana('G'),
      activated('{2}{G}{G}', function* (c) {
        const id = tgt(c);
        // rulings 2-5: copia a carta impressa (X = 0); marcadores e efeitos continuam; não é entrar no campo
        if (id !== null) becomeCopy(c, c.source, id, { duration: { kind: 'endOfTurn' } });
      }, {
        condition: (c) => tiposNoCemiterio(c, c.you) >= 4,
        targets: [t.card('graveyard', (c, id) => isPermanentCard(c.g, id), 'carta de permanente alvo do seu cemitério', 'you')],
        text: 'Delírio — {2}{G}{G}: Este terreno vira uma cópia da carta de permanente alvo do seu cemitério até o fim do turno. Ative somente se houver quatro ou mais tipos de carta entre as cartas no seu cemitério.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: entra virado sem Forest; desvirado com uma Forest',
    2: 'regra geral: CR 707.2 — copia só os valores impressos da carta (motor/criaturas.ts becomeCopy)',
    3: 'regra geral: CR 707.2 — marcadores e efeitos que já o afetavam continuam (motor/criaturas.ts becomeCopy)',
    4: 'regra geral: CR 107.3 — X de uma carta fora da pilha vale 0',
    5: 'teste: virar cópia não é entrar no campo: os gatilhos de entrar não disparam',
  },
});
