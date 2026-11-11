// Summoning Materia
// You may look at the top card of your library any time.
// As long as this Equipment is attached to a creature, you may cast creature spells from the top of your library.
// Equipped creature gets +2/+2 and has vigilance and "{T}: Add {G}."
// Equip {2}
import { attachedGets, defineAbility, defineCard, equip, isCreature, mana, staticAbility } from '../../motor/api.ts';

const MANA = 'Summoning Materia:mana';
defineAbility(MANA, mana('G', { text: '{T}: Adicione {G}.' }));

export default defineCard({
  name: 'Summoning Materia',
  faces: [{
    abilities: [
      // ruling 2: olhar a carta do topo não usa a pilha
      staticAbility({ rules: { lookAtTopOfLibrary: (c, p) => p === c.you }, text: 'Você pode olhar a carta do topo do seu grimório a qualquer momento.' }),
      staticAbility({
        rules: {
          // ruling 1: só a zona muda; o tempo e os custos continuam os da mágica de criatura
          mayPlayFrom: (c, p, carta) => {
            const anexada = c.g.state.objects[c.source]?.attachedTo;
            if (anexada === null || anexada === undefined || !c.g.state.objects[anexada] || !isCreature(c.g, anexada)) return null;
            if (p !== c.you || c.g.state.zones.library[p][0] !== carta || !isCreature(c.g, carta)) return null;
            return { key: `summoning-materia:${c.source}`, label: 'conjurar do topo do grimório' };
          },
        },
        text: 'Enquanto este Equipamento estiver anexado a uma criatura, você pode conjurar mágicas de criatura do topo do seu grimório.',
      }),
      attachedGets(() => [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'vigilance' }, { k: 'addAbility', id: MANA }], 'A criatura equipada recebe +2/+2 e tem vigilância e "{T}: Adicione {G}."'),
      equip('{2}'),
    ],
  }],
  rulings: {
    1: 'teste: anexado a uma criatura, conjura do topo do grimório uma mágica de criatura, no tempo e pagando o custo dela',
    2: 'teste: você pode olhar a carta do topo do seu grimório a qualquer momento; o oponente não',
    3: 'regra geral: CR 401.5 — a carta do topo do grimório não está na mão: não dá para ciclá-la, descartá-la nem ativar habilidades dela (motor/priority.ts só oferece as permissões de conjurar)',
    4: 'regra geral: a carta nova do topo só é mostrada depois que a conjuração termina (o cliente lê o estado depois de cada ação)',
  },
});
