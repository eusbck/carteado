// Stalking Leonin
// When this creature enters, secretly choose an opponent.
// Reveal the player you chose: Exile target creature that's attacking you if it's controlled by the chosen player.
// Activate only once.
import { activated, chooseItems, controllerOf, defineCard, etb, exile, t, tgt } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Stalking Leonin',
  faces: [{
    abilities: [
      // a escolha fica guardada no próprio objeto (rulings 2-3: cada Leonin tem a sua; objeto novo escolhe de novo)
      etb(function* (c) {
        const ops = c.g.opponents(c.you);
        const o = c.g.state.objects[c.source];
        if (!ops.length || !o || o.zone !== 'battlefield') return;
        const [esc] = ops.length === 1 ? [String(ops[0])] : yield* chooseItems(c.g, c.you, 'Stalking Leonin: escolha um oponente em segredo', ops.map((p) => ({ id: String(p), label: c.g.state.players[p].name })), 1, 1);
        o.data.leoninEscolhido = Number(esc);
      }, { text: 'Quando esta criatura entra, escolha um oponente em segredo.' }),
      // o custo é revelar o jogador escolhido (ruling 4: sem jogador escolhido, não dá para pagar)
      activated([], function* (c) {
        const o = c.g.state.objects[c.source] ?? c.g.state.lki[c.source]?.obj;
        const escolhido = o?.data.leoninEscolhido as PlayerId | undefined;
        if (o) o.data.leoninUsado = true;
        if (escolhido === undefined) return;
        c.g.log(`Stalking Leonin: o jogador escolhido era ${c.g.state.players[escolhido].name}.`);
        const id = tgt(c);
        if (id !== null && controllerOf(c.g, id) === escolhido) yield* exile(c.g, [id]);
      }, {
        condition: (c) => {
          const o = c.g.state.objects[c.source];
          return !!o && o.data.leoninEscolhido !== undefined && !o.data.leoninUsado;
        },
        // ruling 5: a criatura que ataca um planeswalker seu não está atacando você
        targets: [t.creature((c, id) => (c.g.state.combat?.attackers ?? []).some((a) => a.id === id && !a.removed && a.target.kind === 'player' && a.target.id === c.you), 'criatura alvo que está atacando você')],
        text: 'Revele o jogador que você escolheu: Exile a criatura alvo que está atacando você se ela for controlada pelo jogador escolhido. Ative só uma vez.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: a escolha fica guardada no objeto, sem aparecer para os outros jogadores (cartas/defs/stalking-leonin.ts)',
    2: 'regra geral: CR 400.7 — cada Stalking Leonin guarda a própria escolha',
    3: 'regra geral: CR 400.7 — saindo e voltando, é um objeto novo: escolhe de novo e pode ativar de novo',
    4: 'teste: sem jogador escolhido, a habilidade não pode ser ativada',
    5: 'regra geral: o alvo tem de estar atacando você, o jogador; quem ataca um planeswalker seu não é alvo legal (cartas/defs/stalking-leonin.ts)',
  },
});
