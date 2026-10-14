// Hot Pursuit
// When this enchantment enters, suspect target creature an opponent controls. As long as this enchantment remains on
// the battlefield, that creature is also goaded.
// At the beginning of combat on your turn, if two or more players have lost the game, gain control of all goaded
// and/or suspected creatures until end of turn. Untap them. They gain haste until end of turn.
import { controllerOf, defineCard, etb, gainControl, on, staticAbility, t, tgt, triggered, untap, untilEndOfTurn } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import { goadada, SUSPEITAR, suspeita, suspeitar } from '../culpa.ts';

const perderam = (c: SCtx): number => c.g.state.players.filter((p) => p.lost || p.conceded).length;

export default defineCard({
  name: 'Hot Pursuit',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id === null) return;
        suspeitar(c.g, id, c.you);
        // ruling 1: se o encantamento já saiu, a criatura fica suspeita mas não goadada
        const eu = c.g.state.objects[c.source];
        if (eu?.zone === 'battlefield') { eu.data.perseguida = id; c.g.bump(); }
      }, { targets: [t.creature((c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id)), 'criatura alvo que um oponente controla')], text: 'Quando este encantamento entra, suspeite da criatura alvo que um oponente controla. Enquanto este encantamento estiver no campo, essa criatura também está goadada.' }),
      staticAbility({ rules: { goads: (c, obj) => c.g.state.objects[c.source]?.data.perseguida === obj } }),
      triggered(on.beginCombat('you'), function* (c) {
        // ruling 2: todas as goadadas e/ou suspeitas, sem escolha
        const ids = c.g.state.zones.battlefield.filter((id) => goadada(c.g, id) || suspeita(c.g, id));
        for (const id of ids) gainControl(c.g, id, c.you, { kind: 'endOfTurn' }, c.source);
        for (const id of ids) untap(c.g, id);
        untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'haste' }]);
      }, {
        condition: (c) => perderam(c) >= 2,
        text: 'No início do combate no seu turno, se dois ou mais jogadores tiverem perdido o jogo, ganhe o controle de todas as criaturas goadadas e/ou suspeitas até o fim do turno. Desvire-as. Elas ganham ímpeto até o fim do turno.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: suspeita a criatura alvo e a mantém goadada enquanto estiver no campo; saindo, ela continua suspeita mas não goadada',
    2: 'teste: com dois jogadores fora, no seu combate você ganha o controle das goadadas e suspeitas, desviradas e com ímpeto',
    3: SUSPEITAR.designacao,
    4: SUSPEITAR.semHabilidades,
    5: SUSPEITAR.copia,
    6: SUSPEITAR.deNovo,
    7: SUSPEITAR.varias,
  },
});
