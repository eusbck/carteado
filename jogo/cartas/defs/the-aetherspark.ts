// The Aetherspark
// As long as The Aetherspark is attached to a creature, The Aetherspark can't be attacked and has "Whenever equipped
// creature deals combat damage during your turn, put that many loyalty counters on The Aetherspark."
// +1: Attach The Aetherspark to up to one target creature you control. Put a +1/+1 counter on that creature.
// −5: Draw two cards.
// −10: Add ten mana of any one color.
import { activated, addCounters, addMana, attach, chooseColor, defineCard, draw, is, on, staticAbility, t, tgt, triggered, upTo } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const anexada = (c: SCtx) => {
  const o = c.g.state.objects[c.source];
  return !!o && o.zone === 'battlefield' && o.attachedTo !== null && !!c.g.state.objects[o.attachedTo];
};

export default defineCard({
  name: 'The Aetherspark',
  faces: [{
    abilities: [
      // ruling 1: só a declaração de ataque é proibida; se ela se anexa enquanto é atacada, continua sendo atacada
      staticAbility({
        rules: { canAttack: (c, _atacante, alvo) => !(alvo.kind === 'obj' && alvo.id === c.source && anexada(c)) },
        text: 'Enquanto The Aetherspark estiver anexada a uma criatura, ela não pode ser atacada.',
      }),
      // o dano de combate de uma etapa chega num lote: soma o que a criatura equipada causou
      triggered(on.batch((evs, c) => {
        const o = c.g.state.objects[c.source];
        if (!o || o.attachedTo === null || c.g.state.turn.active !== c.you) return false;
        const n = evs.reduce((s, e) => s + (e.type === 'damage' && e.combat && e.source === o.attachedTo ? e.amount : 0), 0);
        return n > 0 ? { dano: n } : false;
      }), function* (c) {
        const n = Number(c.event.dano ?? 0);
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'loyalty', n, c.you);
      }, { text: 'Enquanto anexada a uma criatura: sempre que a criatura equipada causa dano de combate durante o seu turno, coloque essa quantidade de marcadores de lealdade em The Aetherspark.' }),
      activated('+1', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        if (c.g.state.objects[c.source]?.zone === 'battlefield') attach(c.g, c.source, id);
        addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { targets: [upTo(1, t.creature(is.yours, 'até uma criatura alvo que você controla'))], text: '+1: Anexe The Aetherspark a até uma criatura alvo que você controla. Coloque um marcador +1/+1 nessa criatura.' }),
      activated('−5', function* (c) { yield* draw(c.g, c.you, 2); }, { text: '−5: Compre duas cartas.' }),
      activated('−10', function* (c) {
        const cor = yield* chooseColor(c.g, c.you, 'The Aetherspark: escolha a cor das dez manas');
        addMana(c.g, c.you, Array(10).fill(cor));
      }, { text: '−10: Adicione dez manas de uma mesma cor.' }),
    ],
  }],
  rulings: {
    1: 'teste: anexada, não pode ser atacada; sem estar anexada, pode',
  },
});
