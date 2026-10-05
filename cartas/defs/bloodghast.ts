// Bloodghast
// This creature can't block.
// This creature has haste as long as an opponent has 10 or less life.
// Landfall — Whenever a land you control enters, you may return this card from your graveyard to the battlefield.
import { defineCard, keyword, on, putOntoBattlefield, selfGets, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Bloodghast',
  faces: [{
    abilities: [
      { ...keyword('cantBlock'), text: 'Esta criatura não pode bloquear.' },
      selfGets((c) => (c.g.opponents(c.you).some((p) => c.g.state.players[p].life <= 10) ? [{ k: 'addKeyword', kw: 'haste' }] : []),
        'Esta criatura tem ímpeto enquanto um oponente tiver 10 ou menos de vida.'),
      // ruling 1: só dispara se já estiver no cemitério quando o terreno entra
      triggered(on.landfall(), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'graveyard') return;
        if (yield* yesNo(c.g, c.you, 'Bloodghast: voltar do cemitério para o campo?')) yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you }], 'effect');
      }, { zones: ['graveyard'], text: 'Queda de terreno — Sempre que um terreno que você controla entra, você pode devolver esta carta do seu cemitério para o campo.' }),
    ],
  }],
  rulings: {
    1: 'teste: só dispara estando no cemitério quando o terreno entra',
    2: 'não se aplica: nenhuma carta dos decks transforma um permanente em terreno',
    3: 'regra geral: CR 603.3b — o controlador ordena os gatilhos',
    4: 'teste: dispara jogando o terreno',
  },
});
