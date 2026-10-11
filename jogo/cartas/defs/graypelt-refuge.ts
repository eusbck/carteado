// Graypelt Refuge
// This land enters tapped.
// When this land enters, you gain 1 life.
// {T}: Add {G} or {W}.
import { defineCard, etb, gainLife, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Graypelt Refuge",
  faces: [{ abilities: [
    land.tapped(),
    etb(function* (c) { gainLife(c.g, c.you, 1, c.source); }, { text: 'Quando este terreno entra, você ganha 1 de vida.' }),
    mana(['G', 'W']),
  ] }],
  rulings: {},
});
