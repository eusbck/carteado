// Genesis Ultimatum
// Look at the top five cards of your library. Put any number of permanent cards from among them onto the battlefield and
// the rest into your hand. Exile Genesis Ultimatum.
import { chooseItems, defineCard, exile, is, moveObjects, nameOf, objItem, putOntoBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Genesis Ultimatum',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 5);
        const permanentes = topo.filter((id) => is.permanentCard({ g: c.g, you: c.you, source: c.source }, id));
        // rulings 2, 5: pode não colocar nenhuma; as que ficam vão para a mão sem serem reveladas
        const esc = permanentes.length
          ? yield* chooseItems(c.g, c.you, 'Genesis Ultimatum: escolha as cartas de permanente que vão para o campo de batalha (o resto vai para a sua mão)', permanentes.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, permanentes.length)
          : [];
        const campo = esc.map(Number);
        // entram todas juntas (ruling 1: uma Aura não pode encantar o que entra junto com ela)
        if (campo.length) yield* putOntoBattlefield(c.g, campo.map((id) => ({ id, controller: c.you })), 'effect');
        const resto = topo.filter((id) => !campo.includes(id) && s.objects[id]?.zone === 'library');
        if (resto.length) yield* moveObjects(c.g, resto.map((id) => ({ id, to: 'hand' as const })), 'effect');
        // "Exile Genesis Ultimatum": parte da resolução; uma cópia simplesmente deixa de existir
        if (s.objects[c.source]?.zone === 'stack') yield* exile(c.g, [c.source]);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 303.4f — a Aura que entra sem ser conjurada escolhe o que encantar ao entrar, entre o que já está no campo (motor/actions.ts putOntoBattlefield)',
    2: 'teste: põe no campo as permanentes escolhidas, o resto vai para a mão e a mágica é exilada',
    3: 'regra geral: CR 603.3b — os gatilhos de entrar vão para a pilha depois que a mágica termina de resolver (motor/turn.ts)',
    4: 'regra geral: CR 303.4f — a Aura que entra assim não tem alvo; sem nada legal para encantar, fica onde estava',
    5: 'teste: pode não escolher nenhuma permanente',
    6: 'regra geral: CR 603.3b — os gatilhos de entrar vão para a pilha depois que a mágica termina de resolver (motor/turn.ts)',
    7: 'regra geral: CR 303.4f — a Aura que entra assim não tem alvo; sem nada legal para encantar, fica onde estava',
    8: 'regra geral: CR 303.4f — a Aura que entra sem ser conjurada escolhe o que encantar ao entrar, entre o que já está no campo (motor/actions.ts putOntoBattlefield)',
  },
});
