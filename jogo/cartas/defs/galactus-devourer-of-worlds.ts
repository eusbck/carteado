// Galactus, Devourer of Worlds
// Flying, trample, indestructible
// When Galactus enters, exile target permanent.
// Insatiable Hunger — Galactus attacks an opponent with the most life among your opponents each combat if able unless
// you control a creature named Silver Surfer, Galactus's Herald.
import { controllerOf, defineCard, etb, exile, isCreature, keywords, nameOf, staticAbility, t, tgt } from '../../motor/api.ts';

const ARAUTO = "Silver Surfer, Galactus's Herald";

export default defineCard({
  name: 'Galactus, Devourer of Worlds',
  faces: [{
    abilities: [
      ...keywords('flying', 'trample', 'indestructible'),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* exile(c.g, [id]);
      }, { targets: [t.permanent()], text: 'Quando Galactus entra, exile o permanente alvo.' }),
      staticAbility({
        rules: {
          // com empate na maior vida, qualquer um dos empatados cumpre a exigência (CR 508.1d)
          attacksOneOfIfAble: (c, criatura) => {
            if (criatura !== c.source) return null;
            const s = c.g.state;
            if (s.zones.battlefield.some((id) => !s.objects[id].phasedOut && controllerOf(c.g, id) === c.you && isCreature(c.g, id) && nameOf(c.g, id) === ARAUTO)) return null;
            const ops = c.g.opponents(c.you);
            if (!ops.length) return null;
            const maior = Math.max(...ops.map((p) => s.players[p].life));
            return ops.filter((p) => s.players[p].life === maior);
          },
        },
        text: "Fome Insaciável — Galactus ataca um oponente com a maior vida entre os seus oponentes a cada combate se puder, a menos que você controle uma criatura chamada Silver Surfer, Galactus's Herald.",
      }),
    ],
  }],
  rulings: {},
});
