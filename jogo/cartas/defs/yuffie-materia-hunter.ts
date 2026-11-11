// Yuffie, Materia Hunter
// Ninjutsu {1}{R} ({1}{R}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from
// your hand tapped and attacking.)
// When Yuffie enters, gain control of target noncreature artifact for as long as you control Yuffie. Then you may
// attach an Equipment you control to Yuffie.
import { and, attach, chooseItems, controllerOf, defineCard, etb, gainControl, is, nameOf, ninjutsu, not, objItem, t, tgt } from '../../motor/api.ts';
import { equipamentosDe } from '../jin.ts';

export default defineCard({
  name: 'Yuffie, Materia Hunter',
  faces: [{
    abilities: [
      // CR 702.49; rulings 2-4 e 7-9: entra atacando quem o devolvido atacava, sem ter sido declarada (motor/conjurar-alternativo.ts)
      ninjutsu('{1}{R}'),
      etb(function* (c) {
        // ruling 1: com o alvo ilegal, a habilidade não resolve e nada é anexado
        const alvo = tgt(c);
        if (alvo === null) return;
        const yuffie = c.g.state.objects[c.source];
        // ruling 6: se Yuffie saiu do campo ou você perdeu o controle dela, não ganha o controle do artefato
        if (!yuffie || yuffie.zone !== 'battlefield' || controllerOf(c.g, c.source) !== c.you) return;
        // CR 611.2b: o efeito acaba quando você deixa de controlar Yuffie (motor/sba.ts, motor/state.ts endEffectsTiedTo)
        gainControl(c.g, alvo, c.you, { kind: 'whileControlled', obj: c.source, player: c.you }, c.source);
        const eqs = equipamentosDe(c.g, c.you).filter((id) => c.g.state.objects[id].attachedTo !== c.source);
        if (!eqs.length) return;
        const [eq] = yield* chooseItems(c.g, c.you, 'Yuffie: você pode anexar a ela um Equipamento que você controla', eqs.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        // ruling 5: um Equipamento que não pode ser anexado a Yuffie fica onde está (CR 301.5c)
        if (eq !== undefined) attach(c.g, Number(eq), c.source);
      }, {
        targets: [t.permanent(and(is.artifact, not(is.creature)), 'artefato alvo que não é criatura')],
        text: 'Quando Yuffie entra, ganhe o controle do artefato alvo que não é criatura enquanto você controlar Yuffie. Depois, você pode anexar a Yuffie um Equipamento que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: com o alvo ilegal na resolução, não ganha o controle nem anexa nada',
    2: 'teste: pelo ninjutsu, entra atacando o mesmo jogador que o atacante devolvido e rouba o artefato alvo',
    3: 'regra geral: CR 702.49a — o ninjutsu exige um atacante não bloqueado, que só existe depois de declarados os bloqueadores (motor/costs.ts returnUnblockedAttacker)',
    4: 'regra geral: CR 510.4 — quem entra atacando depois do primeiro dano (de iniciativa) causa dano na etapa normal (motor/combat.ts)',
    5: 'teste: rouba um Equipamento do oponente e o anexa a Yuffie; um Equipamento que não pode ser anexado fica onde está',
    6: 'teste: se Yuffie sai do campo antes de o gatilho resolver, não ganha o controle',
    7: 'regra geral: CR 702.49a — Yuffie só entra se ainda estiver na mão quando o ninjutsu resolve (motor/conjurar-alternativo.ts ninjutsu)',
    8: 'regra geral: CR 506.3 — quem entra atacando não foi declarada atacante e não dispara "sempre que ataca" (motor/actions.ts putOntoBattlefield)',
    9: 'regra geral: CR 702.49a — o ninjutsu pode ser ativado nas etapas de bloqueadores, de dano e de fim de combate (motor/costs.ts)',
  },
});
