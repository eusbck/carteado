// Wishclaw Talisman
// This artifact enters with three wish counters on it.
// {1}, {T}, Remove a wish counter from this artifact: Search your library for a card, put it into your hand, then
// shuffle. An opponent gains control of this artifact. Activate only during your turn.
import { activated, chooseItems, defineCard, entersWithCounters, gainControl, playerItem } from '../../motor/api.ts';
import { tutor } from '../cedh.ts';

export default defineCard({
  name: 'Wishclaw Talisman',
  faces: [{
    abilities: [
      entersWithCounters('wish', 3),
      activated('{1}, {T}, Remove a wish counter from this artifact', function* (c) {
        const g = c.g;
        yield* tutor(c, 'hand');
        // ruling 2: o oponente é escolhido na resolução; se ele sair da partida, o controle volta (CR 800.4a)
        const ops = g.opponents(c.you).filter((p) => !g.state.players[p].left);
        if (!ops.length || g.state.objects[c.source]?.zone !== 'battlefield') return;
        const [p] = ops.length === 1 ? [String(ops[0])] : yield* chooseItems(g, c.you, 'Wishclaw Talisman: escolha o oponente que ganha o controle', ops.map((x) => playerItem(g, x)), 1, 1);
        gainControl(g, c.source, Number(p), { kind: 'permanent' }, c.source);
      }, {
        // "Ative somente durante o seu turno"
        condition: (c) => c.g.state.turn.active === c.you,
        text: '{1}, {T}, Remova um marcador de desejo deste artefato: Procure uma carta no seu grimório, coloque-a na sua mão e embaralhe. Um oponente ganha o controle deste artefato. Ative somente durante o seu turno.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: sem marcadores de desejo, a habilidade não pode ser ativada',
    2: 'teste: busca, e o oponente escolhido ganha o controle; ele só pode ativar no turno dele',
  },
});
