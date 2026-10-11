// Fatespinner
// At the beginning of each opponent's upkeep, that player chooses draw step, main phase, or combat phase. The player
// skips each instance of the chosen step or phase this turn.
import { chooseOne, defineCard, on, triggered } from '../../motor/api.ts';

const OPCOES = [
  { id: 'draw', label: 'Etapa de compra' },
  { id: 'main', label: 'Fase principal' },
  { id: 'combat', label: 'Fase de combate' },
] as const;

export default defineCard({
  name: 'Fatespinner',
  faces: [{
    abilities: [
      triggered(on.upkeep('opponent'), function* (c) {
        const s = c.g.state;
        const p = s.turn.active;
        if (s.players[p].left) return;
        const esc = (yield* chooseOne(c.g, p, 'Fatespinner: escolha o que você pula neste turno (todas as ocorrências)', OPCOES.map((o) => ({ ...o })))) as 'draw' | 'main' | 'combat';
        // rulings 1-2: só o que foi escolhido, todas as ocorrências, mesmo as criadas depois; ruling 3: pode repetir
        s.turn.skip = [...new Set([...(s.turn.skip ?? []), esc])];
        c.g.bump();
        c.g.log(`${s.players[p].name} pula ${esc === 'draw' ? 'a etapa de compra' : esc === 'main' ? 'as fases principais' : 'as fases de combate'} neste turno.`, { rule: '614.10' });
      }, { text: 'No início da manutenção de cada oponente, esse jogador escolhe etapa de compra, fase principal ou fase de combate. O jogador pula todas as ocorrências da etapa ou fase escolhida neste turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: pulando a etapa de compra, o oponente não compra, mas tem fases principais e combate',
    2: 'teste: pulando a fase principal, o turno vai da compra direto para o combate e do combate para a etapa final',
    3: 'teste: com dois Fatespinner, o oponente escolhe para cada um e pode repetir a escolha',
  },
});
