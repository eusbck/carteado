// Bloodsoaked Champion
// This creature can't block.
// Raid — {1}{B}: Return this card from your graveyard to the battlefield. Activate only if you attacked this turn.
import { activated, defineCard, keyword, putOntoBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Bloodsoaked Champion',
  faces: [{
    abilities: [
      { ...keyword('cantBlock'), text: 'Esta criatura não pode bloquear.' },
      // incursão (palavra de habilidade, CR 207.2c); ruling 3: só funciona com a carta no seu cemitério
      activated('{1}{B}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you }], 'effect');
      }, {
        zones: ['graveyard'],
        // rulings 1-2: basta ter atacado com uma criatura neste turno, esteja ela onde estiver agora
        condition: (c) => !!c.g.state.turnStats[c.you]?.attacked,
        text: 'Incursão — {1}{B}: Devolva esta carta do seu cemitério para o campo de batalha. Ative somente se você atacou neste turno.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: depois de atacar com qualquer criatura, volta do cemitério para o campo por {1}{B}',
    2: 'teste: depois de atacar com qualquer criatura, volta do cemitério para o campo por {1}{B}',
    3: 'teste: ele mesmo atacou e morreu: o próprio ataque vale para a incursão',
  },
});
