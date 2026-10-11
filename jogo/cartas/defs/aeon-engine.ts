// Aeon Engine
// This artifact enters tapped.
// {T}, Exile this artifact: Reverse the game's turn order. (For example, if play had proceeded clockwise around the
// table, it now goes counterclockwise.)
import { activated, defineCard, entersTapped } from '../../motor/api.ts';

export default defineCard({
  name: 'Aeon Engine',
  faces: [{
    abilities: [
      entersTapped(),
      activated('{T}, Exile this artifact', function* (c) {
        const s = c.g.state;
        // rulings 1-2: a ordem dos assentos não muda; inverter de novo volta à ordem do começo da partida
        s.turnReversed = !s.turnReversed;
        c.g.bump();
        c.g.log(`A ordem dos turnos é invertida: depois de ${s.players[s.turn.active].name} joga ${s.players[c.g.nextPlayer(s.turn.active)].name}.`);
      }, { text: '{T}, Exile este artefato: Inverta a ordem dos turnos da partida. (Por exemplo, se a partida seguia no sentido horário em volta da mesa, passa a seguir no sentido anti-horário.)' }),
    ],
  }],
  rulings: {
    1: 'teste: inverte a ordem dos turnos, e as escolhas em ordem de turno seguem a ordem nova',
    2: 'teste: invertida de novo, a ordem volta à do começo da partida',
    3: 'não se aplica: o motor não tem turnos extras',
    4: 'teste: com dois jogadores, nada muda',
  },
});
