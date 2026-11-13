// Orvar, the All-Form
// Changeling
// Whenever you cast an instant or sorcery spell, if it targets one or more other permanents you control, create a token
// that's a copy of one of those permanents.
// When a spell or ability an opponent controls causes you to discard this card, create a token that's a copy of target
// permanent.
import { changeling, chooseItems, controllerOf, copiableValues, createTokens, defineCard, is, nameOf, objItem, on, t, tgt, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId, PlayerId, TargetRef } from '../../motor/types.ts';

/**
 * Os permanentes que você controla e que a mágica mira (sem Orvar). Rulings 3 e 4: na resolução, os alvos são os da
 * mágica agora, ou os que ela tinha ao sair da pilha; os que saíram do campo não contam (mesmo que tenham virado alvo
 * ilegal, o que ainda está no campo conta).
 */
function alvosSeus(g: G, magica: ObjId, voce: PlayerId, orvar: ObjId): ObjId[] {
  const o = g.state.objects[magica]?.zone === 'stack' ? g.state.objects[magica] : g.state.lki[magica]?.obj;
  const alvos: TargetRef[] = o?.stack?.targets.flat() ?? [];
  const ids = alvos.filter((r): r is TargetRef & { kind: 'obj' } => r.kind === 'obj').map((r) => r.id);
  return [...new Set(ids)].filter((id) => id !== orvar && g.state.objects[id]?.zone === 'battlefield' && !g.state.objects[id].phasedOut && controllerOf(g, id) === voce);
}

export default defineCard({
  name: 'Orvar, the All-Form',
  faces: [{
    abilities: [
      // ruling 12: polimorfo vale em todas as zonas (CR 702.73a, motor/criaturas.ts)
      changeling(),
      triggered(on.custom((e, c) => {
        if (e.type !== 'cast' || e.player !== c.you || !c.g.state.objects[e.obj] || !is.instantOrSorcery(c, e.obj)) return false;
        return alvosSeus(c.g, e.obj, c.you, c.source).length ? { magica: e.obj } : false;
      }), function* (c) {
        // ruling 2: só os permanentes seus que são alvos; com mais de um, você escolhe qual copiar ao criar a ficha
        const cands = alvosSeus(c.g, c.event.magica as ObjId, c.you, c.source);
        if (!cands.length) return;
        let modelo = cands[0];
        if (cands.length > 1) {
          const [r] = yield* chooseItems(c.g, c.you, 'Orvar: escolha o permanente que a ficha vai copiar', cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
          modelo = Number(r);
        }
        // rulings 6 a 10: copia os valores copiáveis (CR 707.2), X vale 0, e as habilidades de entrar do modelo funcionam
        yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, modelo) }, 1);
      }, {
        // cláusula "se" interveniente (CR 603.4): conferida ao disparar e na resolução (ruling 3)
        condition: (c) => alvosSeus(c.g, c.event.magica as ObjId, c.you, c.source).length > 0,
        text: 'Sempre que você conjura uma mágica instantânea ou de feitiço, se ela mira um ou mais outros permanentes que você controla, crie uma ficha que é uma cópia de um desses permanentes.',
      }),
      // ruling 11: a mágica ou habilidade de um oponente que está resolvendo faz você descartar Orvar (a que está no topo
      // da pilha); o gatilho é visto pela carta já no cemitério (CR 603.10a)
      triggered(on.custom((e, c) => {
        if (e.type !== 'discard' || e.obj !== c.source || e.player !== c.you) return false;
        const topo = c.g.state.zones.stack[c.g.state.zones.stack.length - 1];
        const st = topo !== undefined ? c.g.state.objects[topo]?.stack : undefined;
        return !!st && c.g.isOpponent(c.you, st.controller);
      }), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, 1);
      }, {
        zones: ['graveyard'],
        // ruling 5: qualquer permanente, de qualquer jogador
        targets: [t.permanent(undefined, 'permanente alvo para a ficha copiar')],
        text: 'Quando uma mágica ou habilidade que um oponente controla faz você descartar esta carta, crie uma ficha que é uma cópia do permanente alvo.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: o gatilho resolve antes da mágica que o disparou',
    2: 'teste: com dois permanentes seus como alvo, você escolhe qual a ficha copia; os de outros jogadores não servem',
    3: 'teste: se o permanente alvo saiu do campo antes de resolver, não cria a ficha',
    4: 'regra geral: CR 603.4 — sem a mágica na pilha, usa os alvos que ela tinha ao sair (última informação, cartas/defs/orvar-the-all-form.ts)',
    5: 'teste: descartado por uma mágica de oponente, cria a cópia de qualquer permanente alvo',
    6: 'regra geral: CR 707.2 — copia só os valores copiáveis: sem marcadores, Auras nem efeitos (motor/mecanicas.ts copiableValues)',
    7: 'regra geral: CR 707.2 — a cópia de uma ficha copia o que a criou (motor/mecanicas.ts copiableValues)',
    8: 'regra geral: CR 707.3 — copia o que o permanente estiver copiando (motor/mecanicas.ts copiableValues)',
    9: 'regra geral: CR 107.3 — X do custo do modelo vale 0',
    10: 'regra geral: CR 707.5 — as habilidades de entrar e os "ao entrar" do modelo funcionam (motor/actions.ts putOntoBattlefield)',
    11: 'teste: descartado por uma mágica de oponente, cria a cópia de qualquer permanente alvo; descartado por você, não',
    12: 'regra geral: CR 702.73a — polimorfo funciona em todas as zonas (motor/criaturas.ts changeling)',
    13: 'regra geral: CR 702.73a — tem todos os tipos de criatura (motor/criaturas.ts changeling)',
    14: 'regra geral: CR 613 — um efeito que dá um tipo novo depois sobrescreve o polimorfo (motor/chars.ts, camada 4)',
    15: 'regra geral: CR 613.1d — o polimorfo vale antes de perder as habilidades (motor/chars.ts, CDA na camada 4)',
  },
});
