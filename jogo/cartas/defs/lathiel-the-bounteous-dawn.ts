// Lathiel, the Bounteous Dawn
// Lifelink
// At the beginning of each end step, if you gained life this turn, distribute up to that many +1/+1 counters among any
// number of other target creatures.
import { addCounters, chooseNumber, defineCard, is, keyword, nameOf, on, t, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Lathiel, the Bounteous Dawn',
  faces: [{
    abilities: [
      keyword('lifelink'),
      triggered(on.endStep('each'), function* (c) {
        // ruling 3: os alvos que ficaram ilegais perdem os marcadores deles
        const alvos = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield' ? [r.id as ObjId] : []));
        if (!alvos.length) return;
        // ruling 5: o total de vida ganha no turno, não a variação do total de vida
        let restam = c.g.state.turnStats[c.you].lifeGained;
        for (let i = 0; i < alvos.length && restam > 0; i++) {
          // ruling 1: cada alvo recebe pelo menos um marcador
          const max = restam - (alvos.length - 1 - i);
          const n = max <= 1 ? 1 : yield* chooseNumber(c.g, c.you, `Lathiel: quantos marcadores +1/+1 em ${nameOf(c.g, alvos[i])}? (restam ${restam})`, 1, max);
          addCounters(c.g, { kind: 'obj', id: alvos[i] }, '+1/+1', n, c.you);
          restam -= n;
        }
      }, {
        // CR 603.4: cláusula "se" interveniente; ruling 2: pode não escolher alvo nenhum
        condition: (c) => c.g.state.turnStats[c.you].lifeGained > 0,
        targets: [{ ...t.creature(is.other, 'outras criaturas alvo'), min: 0, max: (c) => c.g.state.turnStats[c.you].lifeGained }],
        text: 'No início de cada etapa final, se você ganhou vida neste turno, distribua até essa quantidade de marcadores +1/+1 entre qualquer número de outras criaturas alvo.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: tendo ganhado vida no turno, distribui até essa quantidade de marcadores +1/+1 entre outras criaturas alvo',
    2: 'teste: sem escolher alvos, nenhum marcador é colocado',
    3: 'regra geral: CR 608.2b — os marcadores dos alvos que ficaram ilegais se perdem (cartas/defs/lathiel-the-bounteous-dawn.ts)',
    4: 'regra geral: simplificação — a distribuição é escolhida na resolução, com a vida ganha no turno até ali; pela regra (CR 601.2d) seria ao pôr o gatilho na pilha',
    5: 'teste: tendo ganhado vida no turno, distribui até essa quantidade de marcadores +1/+1 entre outras criaturas alvo',
  },
});