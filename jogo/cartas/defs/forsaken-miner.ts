// Forsaken Miner
// This creature can't block.
// Whenever you commit a crime, you may pay {B}. If you do, return this card from your graveyard to the battlefield.
// (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)
import { defineCard, keyword, mayPay, onYouCommitCrime, putOntoBattlefield, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Forsaken Miner',
  faces: [{
    abilities: [
      { ...keyword('cantBlock'), text: 'Esta criatura não pode bloquear.' },
      // ruling 1: só dispara com a carta no seu cemitério quando o crime é cometido (CR 700.13, motor/crime.ts)
      triggered(onYouCommitCrime(), function* (c) {
        // ruling 2: a escolha de pagar é na resolução
        if (c.g.state.objects[c.source]?.zone !== 'graveyard') return;
        if (!(yield* mayPay(c, c.you, '{B}', 'devolver Forsaken Miner ao campo'))) return;
        if (c.g.state.objects[c.source]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you }], 'effect');
      }, { zones: ['graveyard'], text: 'Sempre que você comete um crime, você pode pagar {B}. Se fizer isso, devolva esta carta do seu cemitério para o campo de batalha.' }),
    ],
  }],
  rulings: {
    1: 'teste: sacrificada no custo de uma mágica criminosa, ainda dispara',
    2: 'teste: no cemitério, um crime deixa pagar {B} para voltar ao campo',
    3: 'regra geral: CR 700.13 — o que é crime (motor/crime.ts; testado em Gisa, the Hellraiser)',
    4: 'regra geral: CR 700.13 — o crime acontece ao conjurar, antes de resolver (motor/crime.ts)',
    5: 'regra geral: CR 603.3b — os gatilhos do mesmo momento vão para a pilha na ordem que você escolher (motor)',
    6: 'regra geral: CR 700.13 — um crime por mágica ou habilidade (motor/crime.ts)',
    7: 'regra geral: só os alvos escolhidos ao conjurar, ativar ou pôr na pilha contam (motor/crime.ts)',
  },
});
