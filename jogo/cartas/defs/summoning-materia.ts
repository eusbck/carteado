// Summoning Materia
// You may look at the top card of your library any time.
// As long as this Equipment is attached to a creature, you may cast creature spells from the top of your library.
// Equipped creature gets +2/+2 and has vigilance and "{T}: Add {G}."
// Equip {2}
import { attachedGets, defineAbility, defineCard, equip, isCreature, isLand, mana, staticAbility } from '../../motor/api.ts';

const MANA = defineAbility('Summoning Materia:mana', mana('G'));

export default defineCard({
  name: 'Summoning Materia',
  faces: [{
    abilities: [
      // ruling 2 e 4: olhar o topo não usa a pilha
      staticAbility({ rules: { lookAtTopOfLibrary: (c, p) => p === c.you }, text: 'Você pode olhar a carta do topo do seu grimório a qualquer momento.' }),
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => {
            if (p !== c.you || c.g.state.objects[c.source]?.attachedTo == null) return null;
            if (c.g.state.zones.library[p][0] !== carta || isLand(c.g, carta) || !isCreature(c.g, carta)) return null;
            return { key: `summoning-materia:${c.source}`, label: 'conjurar do topo do grimório' };
          },
        },
        text: 'Enquanto este Equipamento estiver anexado a uma criatura, você pode conjurar mágicas de criatura do topo do seu grimório.',
      }),
      attachedGets(() => [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'vigilance' }, { k: 'addAbility', id: MANA.id! }],
        'A criatura equipada recebe +2/+2 e tem vigilância e "{T}: Adicione {G}."'),
      equip('{2}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 601.3 — tempo e custos normais; custos alternativos e adicionais podem ser pagos (motor/priority.ts)',
    2: 'regra geral: CR 401.5 — olhar o topo não usa a pilha (motor/view.ts lookAtTopOfLibrary)',
    3: 'regra geral: CR 401.5 — a carta do topo não está na mão: não dá para ciclar nem descartar (motor/priority.ts)',
    4: 'regra geral: CR 401.5 — o novo topo só é visto depois de terminar de conjurar (motor/view.ts)',
  },
});
