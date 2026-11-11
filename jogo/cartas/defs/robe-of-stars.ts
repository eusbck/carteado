// Robe of Stars
// Equipped creature gets +0/+3.
// Astral Projection — {1}{W}: Equipped creature phases out. (Treat it and anything attached to it as though they don't
// exist until its controller's next turn.)
// Equip {1}
import { activated, attachedGets, defineCard, equip, phaseOut } from '../../motor/api.ts';
import { FASE } from '../jin.ts';

export default defineCard({
  name: 'Robe of Stars',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 0, t: 3 }], 'A criatura equipada recebe +0/+3.'),
      // CR 702.26: a criatura e tudo anexado a ela (inclusive este Equipamento) saem de fase (motor/mecanicas.ts phaseOut)
      activated('{1}{W}', function* (c) {
        const eq = c.g.state.objects[c.source];
        const criatura = eq?.zone === 'battlefield' && !eq.phasedOut ? eq.attachedTo : null;
        if (criatura !== null && c.g.state.objects[criatura]?.zone === 'battlefield') phaseOut(c.g, [criatura]);
      }, { text: 'Projeção Astral — {1}{W}: A criatura equipada sai de fase. (Trate-a e tudo que estiver anexado a ela como se não existissem até o próximo turno do controlador dela.)' }),
      equip('{1}'),
    ],
  }],
  rulings: {
    1: FASE.naoExiste,
    2: 'teste: em resposta ao equipar, a Projeção Astral tira a túnica de fase e ela não se move',
    3: 'teste: a criatura sai de fase com a túnica e volta com ela anexada, na próxima etapa de desvirar do controlador',
    4: 'teste: a criatura sai de fase com a túnica e volta com ela anexada, na próxima etapa de desvirar do controlador',
    5: 'teste: a criatura atacante que sai de fase deixa o combate',
    6: FASE.gatilhos,
    7: FASE.duracoes,
    8: FASE.marcadores,
    9: 'não se aplica: nenhuma carta dos decks troca o controle por tempo limitado de uma criatura com a túnica',
  },
});
