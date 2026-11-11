// Rhythm of the Wild
// Creature spells you control can't be countered.
// Nontoken creatures you control have riot. (They enter with your choice of a +1/+1 counter or haste.)
import { anthem, chooseOne, controllerOf, defineCard, isCreature, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Rhythm of the Wild',
  faces: [{
    abilities: [
      // ruling 2: pode ser alvo de quem anula; só não é anulada
      staticAbility({
        rules: { cantBeCountered: (c, spell) => c.g.state.objects[spell]?.stack?.controller === c.you && isCreature(c.g, spell) },
        text: 'As mágicas de criatura que você controla não podem ser anuladas.',
      }),
      // as criaturas que você controla mostram a palavra-chave (para quem olha a carta)
      anthem((c, id) => isCreature(c.g, id) && controllerOf(c.g, id) === c.you && !c.g.state.objects[id].isToken,
        () => [{ k: 'addKeyword', kw: 'riot' }], 'As criaturas que não são fichas que você controla têm motim.'),
      // motim (CR 702.136a) é substituição "ao entrar": decidida conforme a criatura entra, pelas características que ela
      // vai ter no campo (ruling 4); com dois Rhythm, duas escolhas (ruling 5); depois de entrar, fica com o que escolheu
      // (rulings 3, 9). Quem já está no campo e vira criatura não ganha nada (ruling 7)
      staticAbility({
        rules: {
          enterReplacement: (c, ev, seria) => {
            if (ev.controller !== c.you || ev.obj < 0 || c.g.state.objects[ev.obj]?.isToken || !seria.types.includes('Creature')) return null;
            return (function* () {
              const r = yield* chooseOne(c.g, ev.controller, `Motim (${seria.name}): um marcador +1/+1 ou ímpeto?`, [
                { id: 'marcador', label: 'Entrar com um marcador +1/+1' },
                { id: 'impeto', label: 'Ganhar ímpeto' },
              ]);
              if (r === 'marcador') ev.counters['+1/+1'] = (ev.counters['+1/+1'] ?? 0) + 1;
              else ev.enterEffects = [...(ev.enterEffects ?? []), { mods: [{ k: 'addKeyword', kw: 'haste' }], duration: { kind: 'whileOnBattlefield', obj: -1 }, controller: c.you, sourceDef: 'Rhythm of the Wild' }];
            })();
          },
        },
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 614.12 — as substituições de entrar são vistas antes de o evento acontecer (motor/actions.ts putOntoBattlefield)',
    2: 'teste: a mágica de criatura não é anulada',
    3: 'teste: escolhendo ímpeto, a criatura fica com ele depois de o Rhythm sair do campo',
    4: 'regra geral: CR 614.12 — a substituição olha as características que o permanente terá no campo (motor/actions.ts putOntoBattlefield)',
    5: 'teste: com dois Rhythm, duas escolhas',
    6: 'regra geral: CR 614.1c — a escolha é feita conforme entra, sem pilha (motor/actions.ts putOntoBattlefield)',
    7: 'regra geral: CR 614.12 — quem vira criatura já no campo não passa pela substituição de entrar',
    8: 'não se aplica: nenhuma carta dos decks impede marcadores +1/+1 nas suas criaturas',
    9: 'teste: escolhendo ímpeto, a criatura fica com ele depois de o Rhythm sair do campo',
  },
});
