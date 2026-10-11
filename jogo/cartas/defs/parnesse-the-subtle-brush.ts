// Parnesse, the Subtle Brush
// Whenever you or a permanent you control becomes the target of a spell or ability an opponent controls, counter that
// spell or ability unless that player pays 4 life.
// Whenever you copy a spell, up to one target opponent may also copy that spell. They may choose new targets for that
// copy.
import { controllerOf, copySpell, counter, defineCard, loseLife, nameOf, on, t, tgtPlayer, triggered, upTo, yesNo } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Parnesse, the Subtle Brush',
  faces: [{
    abilities: [
      // dispara para cada alvo seu (você ou um permanente seu) de uma mágica ou habilidade de um oponente
      triggered(on.custom((e, c) => {
        if (e.type !== 'target' || !c.g.isOpponent(c.you, e.controller)) return false;
        const meu = e.target.kind === 'player' ? e.target.id === c.you : c.g.state.objects[e.target.id]?.zone === 'battlefield' && controllerOf(c.g, e.target.id) === c.you;
        return meu ? { oque: e.by, quem: e.controller } : false;
      }), function* (c) {
        const g = c.g;
        const oque = c.event.oque as ObjId;
        const quem = c.event.quem as PlayerId;
        const o = g.state.objects[oque];
        if (!o || o.zone !== 'stack') return;
        // CR 119.4: só pode pagar a vida que tem
        const pode = !g.state.players[quem].left && g.state.players[quem].life >= 4;
        const nome = o.stack?.kind === 'spell' ? nameOf(g, oque) : 'a habilidade';
        if (pode && (yield* yesNo(g, quem, `Parnesse: pagar 4 de vida para ${nome} não ser anulada?`, 'Pagar 4 de vida', 'Não pagar'))) {
          loseLife(g, quem, 4, c.source);
          return;
        }
        yield* counter(g, oque);
      }, { text: 'Sempre que você ou um permanente que você controla se torna alvo de uma mágica ou habilidade que um oponente controla, anule essa mágica ou habilidade, a menos que esse jogador pague 4 de vida.' }),
      triggered(on.custom((e, c) => (e.type === 'copySpell' && e.player === c.you ? { copia: e.obj } : false)), function* (c) {
        const g = c.g;
        const op = tgtPlayer(c, 0);
        const copia = c.event.copia as ObjId;
        if (op === null) return;
        if (!(yield* yesNo(g, op, `Parnesse: copiar também ${g.state.lki[copia]?.chars.name ?? nameOf(g, copia)}? (você pode escolher novos alvos)`))) return;
        // CR 707.10: copia a mágica (pela última informação, se ela já saiu da pilha)
        yield* copySpell(g, copia, op, { newTargets: true });
      }, {
        targets: [upTo(1, t.opponent())],
        text: 'Sempre que você copia uma mágica, até um oponente alvo pode copiar essa mágica também. Ele pode escolher novos alvos para essa cópia.',
      }),
    ],
  }],
  rulings: {},
});
