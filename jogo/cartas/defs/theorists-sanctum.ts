// Theorist's Sanctum
// ({T}: Add {U}.)
// As this land enters, you may behold a Jace. If you don't, this land enters tapped. (To behold a Jace, choose a Jace you
// control or reveal a Jace card from your hand.)
// {2}{U}, {T}: Empower Jace 2.
import { activated, asEnters, behold, chars, defineCard } from '../../motor/api.ts';
import { empowerJace } from '../fichas.ts';

export default defineCard({
  name: "Theorist's Sanctum",
  faces: [{
    // a habilidade de mana vem do tipo Island (CR 305.6)
    abilities: [
      // CR 701.4a, 614.12: contemplar ao entrar; sem contemplar, entra virado
      asEnters(function* (c, ev) {
        const visto = yield* behold({ g: c.g, you: ev.controller, source: c.source }, (id) => id !== ev.obj && chars(c.g, id).subtypes.includes('Jace'), 'um Jace', { optional: true });
        if (!visto) ev.tapped = true;
      }, 'Conforme este terreno entra, você pode contemplar um Jace. Se não fizer, ele entra virado.'),
      // CR 701.71a (cartas/fichas.ts empowerJace): rulings 1 a 3
      activated('{2}{U}, {T}', function* (c) { yield* empowerJace(c, 2); }, { text: '{2}{U}, {T}: Fortaleça Jace 2.' }),
    ],
  }],
  rulings: {
    1: 'teste: com uma ficha de Jace sua, os marcadores vão para ela em vez de criar outra',
    2: 'teste: sem ficha de Jace, cria uma com 0 de lealdade e põe dois marcadores',
    3: 'regra geral: CR 701.71a — só fichas de planeswalker Jace recebem os marcadores (cartas/fichas.ts empowerJace)',
    4: 'regra geral: CR 608.2b — com os alvos ilegais, a habilidade não resolve (esta não tem alvo)',
  },
});
