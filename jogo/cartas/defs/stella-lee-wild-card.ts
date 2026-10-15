// Stella Lee, Wild Card
// Whenever you cast your second spell each turn, exile the top card of your library. Until the end of your next turn,
// you may play that card.
// {T}: Copy target instant or sorcery spell you control. You may choose new targets for the copy. Activate only if
// you've cast three or more spells this turn.
import { activated, allowPlay, copySpell, defineCard, exile, is, t, tgt, triggered } from '../../motor/api.ts';
import { segundaMagicaDoTurno } from '../saque.ts';

export default defineCard({
  name: 'Stella Lee, Wild Card',
  faces: [{
    abilities: [
      // ruling 1: as mágicas conjuradas antes de ela entrar contam (cartas/saque.ts segundaMagicaDoTurno)
      triggered(segundaMagicaDoTurno(), function* (c) {
        const topo = c.g.state.zones.library[c.you][0];
        if (topo === undefined) return;
        const [ex] = yield* exile(c.g, [topo]);
        // ruling 2: jogar segue as regras normais (tempo, custos, terreno só na fase principal)
        if (ex !== null && ex !== undefined && c.g.state.objects[ex]?.zone === 'exile') {
          allowPlay(c.g, c.you, c.source, [ex], { kind: 'endOfYourNextTurn', player: c.you, afterTurn: c.g.state.turn.number });
        }
      }, { text: 'Sempre que você conjura a sua segunda mágica em cada turno, exile a carta do topo do seu grimório. Até o fim do seu próximo turno, você pode jogar essa carta.' }),
      activated('{T}', function* (c) {
        const id = tgt(c);
        // rulings 3-8: a cópia tem os mesmos modos, X, divisão e custos pagos; não é conjurada (motor/stack.ts copySpell)
        if (id !== null) yield* copySpell(c.g, id, c.you, { newTargets: true });
      }, {
        targets: [t.spell((c, id) => is.instantOrSorcery(c, id) && c.g.state.objects[id]?.stack?.controller === c.you, 'mágica instantânea ou de feitiço alvo que você controla')],
        condition: (c) => (c.g.state.turnStats[c.you]?.spellsCast ?? 0) >= 3,
        text: '{T}: Copie a mágica instantânea ou de feitiço alvo que você controla. Você pode escolher novos alvos para a cópia. Ative apenas se você tiver conjurado três ou mais mágicas neste turno.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a segunda mágica do turno exila a carta do topo, que pode ser jogada até o fim do seu próximo turno',
    2: 'teste: terreno exilado só pode ser jogado como terreno, na fase principal',
    3: 'teste: com três mágicas no turno, copia uma instantânea sua com novos alvos; antes disso, não ativa',
    4: 'regra geral: CR 707.10 — a cópia tem os mesmos modos (motor/stack.ts copySpell)',
    5: 'regra geral: CR 707.10 — a divisão não muda na cópia (motor/stack.ts copySpell)',
    6: 'regra geral: CR 707.10 — a cópia tem o mesmo X (motor/stack.ts copySpell)',
    7: 'regra geral: CR 707.10 — a cópia leva os custos pagos na original (motor/stack.ts copySpell)',
    8: 'teste: a cópia não é conjurada: não conta como mágica do turno',
  },
});
