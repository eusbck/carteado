// Aminatou's Augury
// Exile the top eight cards of your library. You may put a land card from among them onto the battlefield. Until end of
// turn, for each nonland card type, you may cast a spell of that type from among the exiled cards without paying its
// mana cost.
import { addEffect, chars, chooseItems, defineAbility, defineCard, exile, isLand, nameOf, putOntoBattlefield, staticAbility } from '../../motor/api.ts';
import type { SCtx, StaticDef } from '../../motor/defs.ts';
import type { ContinuousEffect, ObjId, PlayerId } from '../../motor/types.ts';

const TIPOS_NAO_TERRENO = ['Artifact', 'Battle', 'Creature', 'Enchantment', 'Instant', 'Kindred', 'Planeswalker', 'Sorcery'];
const NOMES: Record<string, string> = {
  Artifact: 'artefato', Battle: 'batalha', Creature: 'criatura', Enchantment: 'encantamento', Instant: 'instantânea',
  Kindred: 'tribal', Planeswalker: 'planeswalker', Sorcery: 'feitiço',
};

/**
 * Uma permissão por tipo de carta não terreno, num efeito até o fim do turno: a carta de vários tipos aparece uma vez para
 * cada tipo ainda não usado, e conjurar por um deles gasta só esse (ruling 2). Sem pagar o custo de mana (CR 118.9), no
 * tempo normal da mágica (ruling 4).
 */
const PERMISSAO = defineAbility<StaticDef>("Aminatou's Augury:permissao", staticAbility({
  rules: {
    mayPlayFrom: (c, p, carta) => {
      const ctx = c as SCtx & { params?: { objs: ObjId[]; player: PlayerId; tipo: string }; effect?: ContinuousEffect };
      const prm = ctx.params;
      const o = c.g.state.objects[carta];
      if (!prm || !ctx.effect || p !== prm.player || !prm.objs.includes(carta) || o?.zone !== 'exile') return null;
      // ruling 3: terreno (mesmo com outro tipo) não é jogado depois
      if (isLand(c.g, carta) || !chars(c.g, carta).types.includes(prm.tipo)) return null;
      const efeito = ctx.effect.id;
      return {
        key: `augury:${efeito}`, label: `sem pagar o custo de mana, como ${NOMES[prm.tipo] ?? prm.tipo} (Aminatou's Augury)`, free: true,
        onUse: (cc) => { cc.g.state.effects = cc.g.state.effects.filter((e) => e.id !== efeito); cc.g.bump(); },
      };
    },
  },
  text: "Até o fim do turno, para cada tipo de carta não terreno, você pode conjurar uma mágica desse tipo dentre as cartas exiladas por Aminatou's Augury sem pagar o custo de mana.",
}));

export default defineCard({
  name: "Aminatou's Augury",
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 8);
        if (!topo.length) return;
        const ex = (yield* exile(c.g, topo)).filter((id): id is ObjId => id !== null && s.objects[id]?.zone === 'exile');
        // ruling 1: o terreno entra durante a resolução, mesmo já tendo jogado terreno no turno
        const terrenos = ex.filter((id) => isLand(c.g, id));
        if (terrenos.length) {
          const [r] = yield* chooseItems(c.g, c.you, "Aminatou's Augury: coloque um terreno exilado no campo?",
            [{ id: 'nao', label: 'Nenhum' }, ...terrenos.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } }))], 1, 1);
          if (r !== 'nao') yield* putOntoBattlefield(c.g, [{ id: Number(r), controller: c.you }], 'effect');
        }
        const restantes = ex.filter((id) => s.objects[id]?.zone === 'exile' && !isLand(c.g, id));
        const tipos = TIPOS_NAO_TERRENO.filter((tp) => restantes.some((id) => chars(c.g, id).types.includes(tp)));
        for (const tipo of tipos) {
          addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'endOfTurn' }, affected: null, mods: [{ k: 'rule', id: PERMISSAO.id!, params: { objs: restantes, player: c.you, tipo } }] });
        }
      },
    },
  }],
  rulings: {
    1: 'teste: coloca um terreno exilado no campo e conjura uma criatura e um artefato sem pagar; a segunda criatura, não',
    2: 'teste: a criatura artefato pode ser conjurada como artefato, deixando o tipo criatura livre',
    3: 'regra geral: CR 305.9 — o terreno exilado com outro tipo só entra pela escolha na resolução (a permissão não vale para terrenos)',
    4: 'regra geral: CR 601.3 — o tempo normal da mágica continua valendo (motor/priority.ts canStartCast)',
    5: 'regra geral: CR 118.9a — sem pagar o custo de mana não se escolhe custo alternativo; custos adicionais continuam (motor/stack.ts)',
    6: 'regra geral: CR 107.3b — sem pagar o custo de mana, X vale 0 (motor/stack.ts)',
    7: 'regra geral: CR 400.7 — conjurada, a carta sai do exílio e não pode ser conjurada de novo',
  },
});
