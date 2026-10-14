// Deflecting Palm
// The next time a source of your choice would deal damage to you this turn, prevent that damage. If damage is prevented
// this way, Deflecting Palm deals that much damage to that source's controller.
import { chooseItems, controllerOf, dealDamage, defineAbility, defineCard, nameOf, objItem, ruleEffect } from '../../motor/api.ts';
import type { SCtx, StaticDef } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';

// escudo de uma vez só: previne o próximo dano da fonte escolhida a você e devolve essa quantidade ao controlador dela
// (CR 615.5: a prevenção acontece na hora do dano; o resto do efeito logo depois)
const ESCUDO = defineAbility<StaticDef>('Deflecting Palm:escudo', {
  kind: 'static',
  rules: {
    preventsSomeDamage: (c, alvo, fonte, quantidade) => {
      const prm = (c as SCtx & { params?: { fonte: ObjId; usado?: boolean } }).params;
      if (!prm || prm.usado || prm.fonte !== fonte || alvo.kind !== 'player' || alvo.id !== c.you) return 0;
      prm.usado = true;
      const dono = controllerOf(c.g, fonte);
      dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: dono }, amount: quantidade, combat: false }]);
      return quantidade;
    },
  },
});

export default defineCard({
  name: 'Deflecting Palm',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 2: sem alvo; a fonte é escolhida na resolução (permanentes e mágicas na pilha)
        const s = c.g.state;
        const fontes = [...s.zones.battlefield, ...s.zones.stack.filter((id) => id !== c.source && s.objects[id]?.stack?.kind === 'spell')];
        if (!fontes.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Deflecting Palm: escolha a fonte cujo próximo dano a você neste turno será prevenido', fontes.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
        ruleEffect(c, ESCUDO.id!, { kind: 'endOfTurn' }, { params: { fonte: Number(esc) } });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 616.1 — com várias prevenções, o motor as aplica na ordem em que foram criadas',
    2: 'teste: escolhe a fonte na resolução; o próximo dano dela a você é prevenido e devolvido ao controlador dela, uma vez só',
  },
});
