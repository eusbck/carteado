// Ignoble Hierarch
// Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)
// {T}: Add {B}, {R}, or {G}.
import { defineCard, exalted, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Ignoble Hierarch',
  faces: [{ abilities: [exalted(), mana(['B', 'R', 'G'])] }],
  rulings: { 1: 'teste: atacando com duas, não dispara' },
});
