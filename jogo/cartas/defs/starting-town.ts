// Starting Town
// This land enters tapped unless it's your first, second, or third turn of the game.
// {T}: Add {C}.
// {T}, Pay 1 life: Add one mana of any color.
import { defineCard, entersTapped, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Starting Town',
  faces: [{ abilities: [
    // conta os turnos que você tomou na partida (players[p].turnsTaken, com os extras); no turno de outro jogador não é
    // o "seu primeiro, segundo ou terceiro turno", então entra virado. Sem a contagem (partida antiga), entra desvirado.
    entersTapped((c) => {
      const s = c.g.state;
      if (s.turn.active !== c.you) return false;
      const n = s.players[c.you].turnsTaken;
      return n === undefined || n <= 3;
    }),
    mana('C'),
    // CR 119.4: pagar vida exige ter pelo menos essa vida
    mana('any', { cost: '{T}, Pay 1 life', text: '{T}, Pague 1 de vida: Adicione uma mana de qualquer cor.' }),
  ] }],
  rulings: {
    1: 'teste: Town é um tipo de terreno sem regras próprias (CR 205.3i)',
  },
});
