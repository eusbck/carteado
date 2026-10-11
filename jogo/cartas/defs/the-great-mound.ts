// The Great Mound
// {T}: Add {C}.
// {3}, {T}: Create a tapped Vibranium token. (It's an artifact with indestructible and "{T}: Add {C}. This mana can't
// be spent to cast a nonartifact spell.")
// {6}, {T}: Draw a card.
import { activated, createTokens, defineCard, draw, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'The Great Mound',
  faces: [{ abilities: [
    mana('C'),
    // a ficha Vibranium está em cartas/fichas.ts
    activated('{3}, {T}', function* (c) { yield* createTokens(c.g, c.you, 'Vibranium', 1, { tapped: true }); },
      { text: '{3}, {T}: Crie uma ficha de Vibranium virada (artefato indestrutível com "{T}: Adicione {C}. Essa mana não pode ser gasta para conjurar mágica que não seja de artefato.").' }),
    activated('{6}, {T}', function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{6}, {T}: Compre uma carta.' }),
  ] }],
  rulings: {},
});
