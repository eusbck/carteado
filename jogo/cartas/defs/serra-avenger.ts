// Serra Avenger
// You can't cast Serra Avenger during your first, second, or third turns of the game.
// Flying, vigilance
import { defineCard, keywords } from '../../motor/api.ts';

export default defineCard({
  name: 'Serra Avenger',
  faces: [{
    // CR 601.3: restrição de quando conjurar. Conta os turnos que você tomou (ruling 1: inclusive extras); no turno de
    // outro jogador não se aplica (ruling 3). Sem a contagem (partida salva antes dela existir), não restringe.
    castOnlyIf: (c) => {
      const s = c.g.state;
      if (s.turn.active !== c.you) return true;
      const n = s.players[c.you].turnsTaken;
      return n === undefined || n > 3;
    },
    abilities: [...keywords('flying', 'vigilance')],
  }],
  rulings: {
    1: 'teste: nos seus três primeiros turnos não pode ser conjurada; no quarto, pode (contando turnos extras)',
    2: 'não se aplica: nenhuma carta dos decks reinicia a partida',
    3: 'regra geral: CR 601.3 — no turno de outro jogador a restrição não vale (só importa com lampejo, que nenhuma carta dos decks dá a ela)',
  },
});
