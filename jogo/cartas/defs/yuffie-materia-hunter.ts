// Yuffie, Materia Hunter
// Ninjutsu {1}{R} ({1}{R}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from
// your hand tapped and attacking.)
// When Yuffie enters, gain control of target noncreature artifact for as long as you control Yuffie. Then you may
// attach an Equipment you control to Yuffie.
import { and, attach, chooseItems, defineCard, etb, gainControl, is, nameOf, ninjutsu, not, objItem, t, tgt } from '../../motor/api.ts';
import { equipamentosDoJogador } from '../armaria.ts';

export default defineCard({
  name: 'Yuffie, Materia Hunter',
  faces: [{
    abilities: [
      ninjutsu('{1}{R}'),
      etb(function* (c) {
        const alvo = tgt(c);
        if (alvo === null) return; // ruling 1
        // ruling 6: se Yuffie saiu antes de resolver, o controle não começa (duração "enquanto você controlar")
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        gainControl(c.g, alvo, c.you, { kind: 'whileControlled', obj: c.source, player: c.you }, c.source);
        const eqs = equipamentosDoJogador(c.g, c.you);
        if (!eqs.length) return;
        const [e] = yield* chooseItems(c.g, c.you, 'Anexe um Equipamento seu a Yuffie (opcional)', eqs.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (e !== undefined) attach(c.g, Number(e), c.source); // ruling 5
      }, {
        targets: [t.permanent(and(is.artifact, not(is.creature)), 'artefato não criatura alvo')],
        text: 'Quando Yuffie entra, ganhe o controle do artefato não criatura alvo enquanto você controlar Yuffie. Depois, você pode anexar um Equipamento que você controla a Yuffie.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2b — alvo ilegal: não resolve e nada é anexado (motor/stack.ts)',
    2: 'regra geral: CR 702.49c — entra atacando quem o atacante devolvido atacava (motor/conjurar-alternativo.ts ninjutsu)',
    3: 'regra geral: CR 702.49a — ninjutsu só depois dos bloqueadores (motor/conjurar-alternativo.ts)',
    4: 'regra geral: CR 510.4 — ativado na etapa de dano de primeiro golpe, Yuffie causa dano na etapa normal (motor/combat.ts)',
    5: 'regra geral: CR 701.3b — Equipamento que não pode se anexar fica onde está (motor/actions.ts attach)',
    6: 'teste: ganha o controle de um artefato que não é criatura e pode anexar um Equipamento a Yuffie',
    7: 'regra geral: CR 702.49b — revelar e devolver são custo; Yuffie só entra na resolução (motor/conjurar-alternativo.ts)',
    8: 'regra geral: CR 508.4 — entrar atacando não é ser declarada atacante (motor/conjurar-alternativo.ts)',
    9: 'regra geral: CR 702.49a — ninjutsu nas etapas de bloqueio, dano e fim de combate (motor/conjurar-alternativo.ts)',
  },
});
