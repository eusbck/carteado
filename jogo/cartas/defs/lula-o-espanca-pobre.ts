// Lula, o Espanca Pobre (carta própria da mesa)
// Whenever you cast an enchantment spell, create a 1/1 white Human Citizen creature token named Eleitor.
// Sacrifice two tokens named Eleitor: Exile the top card of target opponent's library. You may play that card this
// turn. It costs {3} less to cast, and mana of any type can be spent to cast it.
import { activated, createTokens, defineAbility, defineCard, exile, is, isLand, manaValue, on, ruleEffect, t, tgtPlayer, triggered } from '../../motor/api.ts';
import type { SCtx, StaticDef } from '../../motor/defs.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';
import { ehEleitor } from '../brasil.ts';

// "Você pode jogar essa carta neste turno. Ela custa {3} a menos, e mana de qualquer tipo pode ser gasta"
// Combinado da mesa: o desconto vale sobre o custo inteiro (também a parte colorida), então valor de mana 3 ou
// menos sai de graça; o que sobra é pago como mana genérica.
const PERMISSAO = defineAbility<StaticDef>('Lula, o Espanca Pobre:permissao', {
  kind: 'static',
  rules: {
    mayPlayFrom: (c, p, carta) => {
      const prm = (c as SCtx & { params?: { objs: ObjId[]; player: PlayerId } }).params;
      if (!prm || prm.player !== p || !prm.objs.includes(carta)) return null;
      if (c.g.state.objects[carta]?.zone !== 'exile') return null;
      if (isLand(c.g, carta)) return { key: `lula:${carta}`, label: 'Lula, o Espanca Pobre', land: true };
      const resto = Math.max(0, manaValue(c.g, carta) - 3);
      return resto === 0
        ? { key: `lula:${carta}`, label: 'Lula, o Espanca Pobre (de graça)', free: true }
        : { key: `lula:${carta}`, label: `Lula, o Espanca Pobre (pagar {${resto}})`, mana: `{${resto}}`, anyType: true };
    },
  },
});

export default defineCard({
  name: 'Lula, o Espanca Pobre',
  faces: [{
    abilities: [
      triggered(on.youCast(is.enchantment), function* (c) {
        yield* createTokens(c.g, c.you, 'Eleitor', 1);
      }, { text: 'Sempre que você conjura uma mágica de encantamento, crie uma ficha de criatura Humano Cidadão 1/1 branca chamada Eleitor.' }),
      activated([{ k: 'sacrifice', n: 2, filter: (c, id) => ehEleitor(c.g, id), label: 'dois Eleitores' }], function* (c) {
        const alvo = tgtPlayer(c);
        if (alvo === null) return;
        const topo = c.g.state.zones.library[alvo][0];
        if (topo === undefined) return;
        const [ex] = yield* exile(c.g, [topo]);
        if (ex === null || ex === undefined || c.g.state.objects[ex]?.zone !== 'exile') return;
        ruleEffect(c, PERMISSAO.id!, { kind: 'endOfTurn' }, { params: { objs: [ex], player: c.you } });
      }, {
        targets: [t.opponent()],
        text: 'Sacrifique dois Eleitores: Exile a carta do topo do grimório do oponente alvo. Você pode jogar essa carta neste turno. Ela custa {3} a menos para ser conjurada, e mana de qualquer tipo pode ser gasta para conjurá-la.',
      }),
    ],
  }],
  rulings: {},
});
