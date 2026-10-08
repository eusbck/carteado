// The Ur-Sphinx
// Eminence — As long as The Ur-Sphinx is in the command zone or on the battlefield, other Sphinx spells you cast cost
// {1} less to cast.
// Flying
// Whenever one or more Sphinxes you control attack, each player mills that many cards. For each player, you may cast a
// card that player milled this way without paying its mana cost.
import {
  castSpell, chars, chooseItems, controllerOf, defineCard, isLand, keyword, mill, nameOf, objItem, on, staticAbility, triggered,
} from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'The Ur-Sphinx',
  faces: [{
    abilities: [
      // eminência: a estática diz em que zonas funciona (CR 113.6b); na pilha ela não reduz o próprio custo
      staticAbility({
        zones: ['battlefield', 'command'],
        rules: {
          costModifier: (c, spell) => (spell.controller === c.you && spell.obj !== c.source && spell.chars.subtypes.includes('Sphinx') ? { reduce: 1 } : null),
        },
        text: 'Eminência — Enquanto The Ur-Sphinx estiver na zona de comando ou no campo, as outras mágicas de Esfinge que você conjura custam {1} a menos.',
      }),
      keyword('flying'),
      // ruling 1: só a declaração de atacantes dispara (CR 508.3a); uma Esfinge que entra atacando nunca "atacou" (508.4)
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers' || e.player !== c.you) return false;
        const n = e.attackers.filter((a) => c.g.state.objects[a.obj] && controllerOf(c.g, a.obj) === c.you && chars(c.g, a.obj).subtypes.includes('Sphinx')).length;
        return n > 0 ? { n } : false;
      }), function* (c) {
        const n = c.event.n as number;
        const moidas = new Map<PlayerId, ObjId[]>();
        for (const p of c.g.apnap()) moidas.set(p, yield* mill(c.g, p, n));
        // ruling 2: conjura durante a resolução (CR 608.2g), ignorando o tempo de feitiço; sem pagar o custo de mana
        // (sem custos alternativos, X = 0; custos adicionais podem/devem ser pagos); terrenos não se conjuram
        for (const p of c.g.apnap()) {
          let cands = (moidas.get(p) ?? []).filter((id) => c.g.state.objects[id]?.zone === 'graveyard' && !isLand(c.g, id));
          while (cands.length) {
            const quem = c.g.state.players[p].name;
            const esc = yield* chooseItems(c.g, c.you, `The Ur-Sphinx: escolha até uma carta moída por ${quem} para conjurar sem pagar o custo de mana`, cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
            if (!esc.length) break;
            const id = Number(esc[0]);
            const r = yield* castSpell(c.g, c.you, id, { key: 'free', label: 'sem pagar o custo de mana', zone: 'graveyard', free: true, duringResolution: true });
            if (r !== null) break;
            // não deu para conjurar (sem alvos, custo adicional impossível…): pode escolher outra
            cands = cands.filter((x) => x !== id && c.g.state.objects[x]?.zone === 'graveyard');
          }
        }
      }, { text: 'Sempre que uma ou mais Esfinges que você controla atacam, cada jogador mói essa quantidade de cartas. Para cada jogador, você pode conjurar uma carta que ele moeu assim sem pagar o custo de mana.' }),
    ],
  }],
  rulings: {
    1: 'teste: uma Esfinge que entra atacando não dispara a última habilidade',
    2: 'teste: conjura na resolução, ignorando o tempo de feitiço, sem pagar o custo de mana e com X = 0',
  },
});
