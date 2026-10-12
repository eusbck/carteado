// Kaya's Ghostform
// Enchant creature or planeswalker you control
// When enchanted permanent dies or is put into exile, return that card to the battlefield under your control.
import { and, defineCard, is, on, or, putOntoBattlefield, t, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Kaya's Ghostform",
  faces: [{
    enchant: t.permanent(and(is.yours, or(is.creature, is.planeswalker)), 'criatura ou planeswalker que você controla'),
    abilities: [
      // olha para trás (CR 603.10a): vale mesmo que a Aura saia junto (ruling 6); ficha não volta (ruling 1)
      triggered(on.custom((e, c) => (e.type === 'zone' && e.from === 'battlefield' && (e.to === 'graveyard' || e.to === 'exile') && c.obj.attachedTo === e.old && !e.token
        ? { carta: e.obj, zona: e.to } : false)), function* (c) {
        const carta = c.event.carta as number;
        // ruling 5: se a carta já saiu dessa zona, fica onde está
        if (c.g.state.objects[carta]?.zone === c.event.zona) yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you }], 'effect');
      }, { text: 'Quando a permanente encantada morre ou é exilada, devolva essa carta ao campo de batalha sob o seu controle.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 111.8 — a ficha que sai do campo deixa de existir e não volta (motor/sba.ts)',
    2: 'regra geral: CR 704.5m — a Aura vai para o cemitério quando a permanente encantada sai do campo; não volta com ela (motor/sba.ts)',
    3: 'regra geral: CR 400.7 — se outro efeito já devolveu a carta ao campo, ela é um objeto novo e o gatilho não a move (cartas/defs/kayas-ghostform.ts)',
    4: 'regra geral: CR 704.5m — se outro jogador ganhar o controle da permanente, a Aura deixa de poder encantá-la e vai para o cemitério (motor/sba.ts)',
    5: 'regra geral: CR 400.7 — se a carta saiu do cemitério ou do exílio antes de o gatilho resolver, fica onde está (cartas/defs/kayas-ghostform.ts)',
    6: 'regra geral: CR 603.10a — é habilidade de sair do campo: olha para trás e dispara mesmo que a Aura saia junto (motor/triggers.ts)',
    7: 'teste: a permanente encantada que morre ou é exilada volta ao campo sob o seu controle',
  },
});