// Treasure Nabber
// Whenever an opponent taps an artifact for mana, gain control of that artifact until the end of your next turn.
import { defineCard, gainControl, isType, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Treasure Nabber',
  faces: [{
    abilities: [
      // ruling 1: só habilidade de mana com {T} do próprio artefato (improvisar não conta)
      triggered(on.custom((e, c) => (e.type === 'mana' && !!e.tappedForMana && c.g.isOpponent(c.you, e.player) && !!c.g.state.objects[e.source] && isType(c.g, e.source, 'Artifact') ? { artefato: e.source } : false)), function* (c) {
        const id = c.event.artefato as ObjId;
        // ruling 2: se o artefato saiu do campo, nada acontece; ruling 3: continua virado
        if (c.g.state.objects[id]?.zone !== 'battlefield') return;
        // rulings 4-5: até o fim do seu próximo turno
        gainControl(c.g, id, c.you, { kind: 'endOfYourNextTurn', player: c.you, afterTurn: c.g.state.turn.number }, c.source);
      }, { text: 'Sempre que um oponente vira um artefato para gerar mana, ganhe o controle desse artefato até o fim do seu próximo turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 106.12 — "virar para gerar mana" é ativar uma habilidade de mana com {T} do artefato (evento mana com tappedForMana)',
    2: 'regra geral: CR 400.7 — se o artefato saiu do campo, não é roubado (cartas/defs/treasure-nabber.ts)',
    3: 'teste: o artefato virado para mana por um oponente passa a ser seu, ainda virado, até o fim do seu próximo turno',
    4: 'teste: o artefato virado para mana por um oponente passa a ser seu, ainda virado, até o fim do seu próximo turno',
    5: 'regra geral: CR 611.2a — a duração de cada efeito é contada do turno em que foi criado; vários Treasure Nabbers não a estendem',
    6: 'regra geral: CR 613.7 — com Treasure Nabbers de vários jogadores, vale o efeito de controle mais recente',
    7: 'regra geral: CR 800.4a — quando um jogador sai, os efeitos de controle dele acabam (motor/actions.ts)',
  },
});
