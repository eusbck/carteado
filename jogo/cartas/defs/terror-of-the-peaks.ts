// Terror of the Peaks
// Flying
// Spells your opponents cast that target this creature cost an additional 3 life to cast.
// Whenever another creature you control enters, this creature deals damage equal to that creature's power to any
// target.
import { controllerOf, dealDamage, defineCard, isCreature, keyword, lkiChars, on, power, staticAbility, t, tgtRef, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Terror of the Peaks',
  faces: [{
    abilities: [
      keyword('flying'),
      // custo adicional concedido, decidido depois dos alvos (CR 601.2f): 3 de vida para cada mágica de oponente que
      // tenha esta criatura como alvo
      staticAbility({
        rules: {
          grantedAdditionalCosts: (c, jogador, magia) => {
            if (!c.g.isOpponent(c.you, jogador)) return null;
            const alvos = c.g.state.objects[magia]?.stack?.targets ?? [];
            if (!alvos.some((grupo) => grupo.some((r) => r.kind === 'obj' && r.id === c.source))) return null;
            return [{ key: `terror:${c.source}`, label: '3 de vida (Terror of the Peaks)', optional: false, parts: [{ k: 'life', n: 3 }], afterTargets: true }];
          },
        },
        text: 'As mágicas que os seus oponentes conjuram que tenham esta criatura como alvo custam 3 de vida a mais para conjurar.',
      }),
      triggered(on.enters((c, id) => id !== c.source && isCreature(c.g, id) && controllerOf(c.g, id) === c.you), function* (c) {
        const alvo = tgtRef(c);
        if (!alvo) return;
        // ruling 1: a força na resolução, ou a última que teve no campo
        const id = c.event.obj as ObjId;
        const n = c.g.state.objects[id]?.zone === 'battlefield' ? power(c.g, id) : (lkiChars(c.g, id)?.power ?? 0);
        if (n > 0) dealDamage(c.g, [{ source: c.source, target: alvo, amount: n, combat: false }]);
      }, { targets: [t.any()], text: 'Sempre que outra criatura que você controla entra, esta criatura causa dano igual à força dessa criatura a qualquer alvo.' }),
    ],
  }],
  rulings: {
    1: 'teste: o dano é a força da criatura que entrou',
  },
});
