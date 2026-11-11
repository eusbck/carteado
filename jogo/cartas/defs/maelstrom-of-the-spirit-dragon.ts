// Maelstrom of the Spirit Dragon
// {T}: Add {C}.
// {T}: Add one mana of any color. Spend this mana only to cast a Dragon spell or an Omen spell.
// {4}, {T}, Sacrifice this land: Search your library for a Dragon card, reveal it, put it into your hand, then shuffle.
import { activated, chars, defineCard, defineFn, mana, searchTo, type G } from '../../motor/api.ts';

// CR 106.6: só para conjurar mágica de Dragon ou mágica de presságio (a face Omen na pilha, CR 720.3b)
const DRAGAO_OU_PRESSAGIO = 'Maelstrom of the Spirit Dragon:restricao';
defineFn(DRAGAO_OU_PRESSAGIO, (g: G, purpose: { kind: string; obj?: number }) => {
  if (purpose.kind !== 'spell' || purpose.obj === undefined) return false;
  const st = chars(g, purpose.obj).subtypes;
  return st.includes('Dragon') || st.includes('Omen');
});

export default defineCard({
  name: 'Maelstrom of the Spirit Dragon',
  faces: [{
    abilities: [
      mana('C'),
      mana('any', { restriction: DRAGAO_OU_PRESSAGIO, text: '{T}: Adicione uma mana de qualquer cor. Gaste essa mana só para conjurar uma mágica de Dragon ou uma mágica de presságio.' }),
      activated('{4}, {T}, Sacrifice this land', function* (c) {
        yield* searchTo(c, c.you, (id) => chars(c.g, id).subtypes.includes('Dragon'), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de Dragon' });
      }, { text: '{4}, {T}, Sacrifique este terreno: Procure uma carta de Dragon no seu grimório, revele-a, coloque-a na sua mão e embaralhe.' }),
    ],
  }],
  rulings: {},
});
