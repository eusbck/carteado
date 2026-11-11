// Baloth Prime
// This creature enters tapped with six stun counters on it.
// Whenever you sacrifice a land, create a tapped 4/4 green Beast creature token and untap this creature.
// {4}, Sacrifice a land: You gain 2 life.
import { activated, asEnters, createTokens, defineCard, gainLife, triggered, untap } from '../../motor/api.ts';
import { sacrificaTerrenoCusto, voceSacrificaTerreno } from '../terras.ts';

export default defineCard({
  name: 'Baloth Prime',
  faces: [{
    abilities: [
      asEnters((_c, ev) => { ev.tapped = true; ev.counters.stun = (ev.counters.stun ?? 0) + 6; }, 'Esta criatura entra virada com seis marcadores de atordoamento.'),
      triggered(voceSacrificaTerreno(), function* (c) {
        yield* createTokens(c.g, c.you, 'Beast 4/4', 1, { tapped: true });
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untap(c.g, c.source);
      }, { text: 'Sempre que você sacrifica um terreno, crie uma ficha de criatura Beast verde 4/4 virada e desvire esta criatura.' }),
      activated([{ k: 'mana', cost: '{4}' }, sacrificaTerrenoCusto], function* (c) { gainLife(c.g, c.you, 2, c.source); }, { text: '{4}, Sacrifique um terreno: Você ganha 2 de vida.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 122.1d — desvirar com marcador de atordoamento só remove um marcador (motor/actions.ts untap)' },
});
