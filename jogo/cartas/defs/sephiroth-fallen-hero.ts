// Sephiroth, Fallen Hero
// Jenova Cells — Whenever Sephiroth attacks, you may put a cell counter on target creature. Until end of turn, each
// modified creature you control has base power and toughness 7/5. (Equipment, Auras you control, and counters are
// modifications.)
// The Reunion — {3}, Sacrifice a modified creature: Return this card from your graveyard to the battlefield tapped.
import { activated, addCounters, creaturesOf, defineCard, isCreature, on, putOntoBattlefield, t, tgt, triggered, untilEndOfTurn, yesNo } from '../../motor/api.ts';
import { modificada } from '../vingadores.ts';

const REUNIAO = activated('{3}', function* (c) {
  const o = c.g.state.objects[c.source];
  if (!o || o.zone !== 'graveyard') return;
  yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you, tapped: true }], 'effect');
}, { zones: ['graveyard'], text: 'A Reunião — {3}, sacrifique uma criatura modificada: Devolva esta carta do seu cemitério para o campo de batalha virada.' });
// "Sacrifice a modified creature": o analisador de custos não conhece "modificada"
REUNIAO.cost.push({ k: 'sacrifice', n: 1, label: 'uma criatura modificada', filter: (c, id) => isCreature(c.g, id) && modificada(c.g, id) });

export default defineCard({
  name: 'Sephiroth, Fallen Hero',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        const alvo = tgt(c);
        // CR 608.2b: com o único alvo ilegal, a habilidade não resolve
        if (alvo === null) return;
        if (yield* yesNo(c.g, c.you, 'Células de Jenova: colocar um marcador de célula na criatura alvo?')) {
          addCounters(c.g, { kind: 'obj', id: alvo }, 'cell', 1, c.you);
        }
        // CR 611.2c: afeta as criaturas modificadas que você controla agora; camada 7b (ruling 2)
        const ids = creaturesOf(c.g, c.you).filter((id) => modificada(c.g, id));
        untilEndOfTurn(c, ids, [{ k: 'setPT', p: 7, t: 5 }]);
      }, {
        targets: [t.creature()],
        text: 'Células de Jenova — Sempre que Sephiroth ataca, você pode colocar um marcador de célula na criatura alvo. Até o fim do turno, cada criatura modificada que você controla tem força e resistência base 7/5.',
      }),
      REUNIAO,
    ],
  }],
  rulings: {
    1: 'teste: o marcador de célula torna a criatura modificada, mesmo pequena, e ela vira 7/5',
    2: 'teste: substitui a força e resistência definidas antes, mas marcadores +1/+1 e outros bônus continuam valendo',
    3: 'teste: equipada por um Equipamento de outro jogador conta como modificada',
    4: 'teste: uma Aura de outro jogador não torna a sua criatura modificada',
  },
});
