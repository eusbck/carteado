// Plaza of Heroes
// {T}: Add {C}.
// {T}: Add one mana of any color. Spend this mana only to cast a legendary spell.
// {T}: Add one mana of any color among legendary permanents you control.
// {3}, {T}, Exile this land: Target legendary creature gains hexproof and indestructible until end of turn.
import { activated, chars, controlledBy, defineCard, defineFn, is, isLegendary, mana, t, tgt, untilEndOfTurn, type G } from '../../motor/api.ts';
import type { Color } from '../../motor/types.ts';

// CR 106.6: mana com restrição de gasto — só para conjurar mágica lendária
const RESTRICAO = 'Plaza of Heroes:lendaria';
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) => purpose.kind === 'spell' && purpose.obj !== undefined && isLegendary(g, purpose.obj));

const CORES: Color[] = ['W', 'U', 'B', 'R', 'G'];

export default defineCard({
  name: 'Plaza of Heroes',
  faces: [{
    abilities: [
      mana('C'),
      mana('any', { restriction: RESTRICAO, text: '{T}: Adicione uma mana de qualquer cor. Gaste essa mana apenas para conjurar uma mágica lendária.' }),
      // CR 106.7 não se aplica: são as cores das permanentes lendárias que você controla agora
      mana((c) => {
        const cores = new Set<Color>();
        for (const id of controlledBy(c.g, c.you, (x) => isLegendary(c.g, x))) for (const cor of chars(c.g, id).colors) cores.add(cor);
        return CORES.filter((x) => cores.has(x)).map((x) => [x]);
      }, { text: '{T}: Adicione uma mana de qualquer cor entre as permanentes lendárias que você controla.' }),
      activated('{3}, {T}, Exile this land', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'hexproof' }, { k: 'addKeyword', kw: 'indestructible' }]);
      }, {
        targets: [t.creature(is.legendary, 'criatura lendária alvo')],
        text: '{3}, {T}, Exile este terreno: A criatura lendária alvo ganha resistência a magia e indestrutível até o fim do turno.',
      }),
    ],
  }],
  rulings: {},
});
