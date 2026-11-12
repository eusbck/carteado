// Baloth Prime
// This creature enters tapped with six stun counters on it. (If a permanent with a stun counter would become untapped,
// remove one from it instead.)
// Whenever you sacrifice a land, create a tapped 4/4 green Beast creature token and untap this creature.
// {4}, Sacrifice a land: You gain 2 life.
import { activated, asEnters, createTokens, defineCard, gainLife, triggered, untap } from '../../motor/api.ts';
import { voceSacrificaTerreno } from '../terras.ts';

export default defineCard({
  name: 'Baloth Prime',
  faces: [{
    abilities: [
      asEnters((_c, ev) => {
        ev.tapped = true;
        ev.counters.stun = (ev.counters.stun ?? 0) + 6;
      }, 'Esta criatura entra virada com seis marcadores de atordoamento.'),
      // ruling 1: sacrificada junto com terrenos, ainda dispara por eles (olha para trás, CR 603.10a)
      triggered(voceSacrificaTerreno(), function* (c) {
        yield* createTokens(c.g, c.you, 'Beast 4/4', 1, { tapped: true });
        // CR 122.1d: com marcador de atordoamento, desvirar só remove um
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untap(c.g, c.source);
      }, { text: 'Sempre que você sacrifica um terreno, crie uma ficha de criatura Besta verde 4/4 virada e desvire esta criatura.' }),
      activated('{4}, Sacrifice a land', function* (c) { gainLife(c.g, c.you, 2, c.source); }, { text: '{4}, Sacrifique um terreno: Você ganha 2 pontos de vida.' }),
    ],
  }],
  rulings: { 1: 'teste: sacrificada junto com um terreno, ainda cria a Besta' },
});
