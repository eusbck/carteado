// Vesuvan Drifter
// Flying
// You may look at the top card of your library any time.
// At the beginning of each combat, you may reveal the top card of your library. If you reveal a creature card this way,
// this creature becomes a copy of that card until end of turn, except it has flying.
import { becomeCopy, defineCard, isCreature, keyword, nameOf, on, staticAbility, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Vesuvan Drifter',
  faces: [{
    abilities: [
      keyword('flying'),
      // rulings 1-3: informação que você tem, sem usar a pilha; como cópia de outra carta, ela não tem esta habilidade
      staticAbility({ rules: { lookAtTopOfLibrary: (c, p) => p === c.you }, text: 'Você pode olhar a carta do topo do seu grimório a qualquer momento.' }),
      triggered(on.beginCombat('each'), function* (c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you][0];
        if (topo === undefined || s.objects[c.source]?.zone !== 'battlefield') return;
        if (!(yield* yesNo(c.g, c.you, `Vesuvan Drifter: revelar ${nameOf(c.g, topo)}, a carta do topo do seu grimório?`))) return;
        c.g.log(`${s.players[c.you].name} revela ${nameOf(c.g, topo)} do topo do grimório.`, { rule: '701.20' });
        if (!isCreature(c.g, topo)) return;
        // rulings 4-6: copia só o que está impresso na carta (X = 0), com voar; o que já a afetava continua
        becomeCopy(c, c.source, topo, { except: { addKeywords: ['flying'] }, duration: { kind: 'endOfTurn' } });
      }, { text: 'No início de cada combate, você pode revelar a carta do topo do seu grimório. Se revelar uma carta de criatura assim, esta criatura vira uma cópia dessa carta até o fim do turno, exceto que tem voar.' }),
    ],
  }],
  rulings: {
    1: 'teste: você pode olhar a carta do topo do seu grimório a qualquer momento',
    2: 'regra geral: CR 401.5 — a carta do topo só passa a ser vista depois de terminar de conjurar ou ativar (o cliente mostra o topo a cada estado)',
    3: 'teste: enquanto é cópia de outra carta, não tem as próprias habilidades',
    4: 'teste: revelando uma carta de criatura, vira uma cópia dela com voar até o fim do turno',
    5: 'regra geral: CR 107.3g — fora da pilha, o X do custo de mana conta 0 (motor/chars.ts)',
    6: 'teste: os marcadores que já estavam nela continuam valendo',
  },
});
