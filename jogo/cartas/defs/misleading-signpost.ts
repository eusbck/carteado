// Misleading Signpost
// Flash
// When this artifact enters during the declare attackers step, you may reselect which player or permanent target attacking creature is attacking. (It can't attack its controller or their permanents.)
// {T}: Add {U}.
import { chooseItems, defineCard, etb, keyword, mana, nameOf, reselectAttackTargets, reselectAttacker, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: "Misleading Signpost",
  faces: [{
    abilities: [keyword('flash'), mana('U'),
    etb(function*(c) {
      const id = tgt(c); if (id === null) return;
      const options = reselectAttackTargets(c.g, id);
      const picked = yield* chooseItems(c.g, c.you, 'Misleading Signpost: você pode mudar quem a criatura está atacando', options.map((target) => target.kind === 'player' ? { id: 'p' + target.id, label: c.g.state.players[target.id].name, player: target.id } : { id: 'o' + target.id, label: nameOf(c.g, target.id), obj: target.id }), 0, 1);
      const target = options.find((t) => (t.kind === 'player' ? 'p' : 'o') + t.id === picked[0]);
      if (target) reselectAttacker(c.g, id, target);
    }, { condition: (c) => c.g.state.turn.step === 'declareAttackers', targets: [t.creature((c, id) => !!c.g.state.combat?.attackers.some((a) => a.id === id && !a.removed), 'criatura atacante alvo')], text: 'Quando entra durante a declaração de atacantes, você pode mudar quem a criatura atacante alvo está atacando.' }),
    ]
  }],
  rulings: {
    "1": "teste: pode conjurar fora da declaração, mas a habilidade de entrada não dispara.",
    "2": "CR 508.7b: teste: reseleção ignora requisitos, restrições e custos, inclusive Propaganda.",
    "3": "CR 508.7a: teste: não emite novo evento de ataque nem dispara novamente gatilhos.",
    "4": "CR 508.7a: conserva o registro do ataque declarado; o dano e bloqueios passam a usar o novo defensor.",
    "5": "CR 115, 608.2b: alvos que dependem do defensor são revalidados com as características atuais na resolução."
  },
});
