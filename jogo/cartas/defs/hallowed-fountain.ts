// Hallowed Fountain
// ({T}: Add {W} or {U}.)
// As this land enters, you may pay 2 life. If you don't, it enters tapped.
import { asEnters, defineCard, loseLife, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Hallowed Fountain',
  // a mana vem dos tipos Plains e Island (CR 305.6)
  faces: [{ abilities: [
    // CR 614.1c: substituição de "ao entrar"; CR 119.4: só paga quem tem pelo menos 2 de vida.
    // Se um efeito já o põe virado, pagar não o desvira (ruling 1).
    asEnters(function* (c, ev) {
      const paga = c.g.state.players[c.you].life >= 2 && (yield* yesNo(c.g, c.you, 'Hallowed Fountain: pagar 2 de vida para entrar desvirado?'));
      if (paga) loseLife(c.g, c.you, 2, c.source);
      else ev.tapped = true;
    }, 'Ao entrar, você pode pagar 2 de vida. Se não pagar, entra virado.'),
  ] }],
  rulings: {
    1: 'teste: posto no campo virado por um efeito, pode pagar 2 de vida mas continua virado',
    2: 'teste: CR 305.6 e 305.8: tem dois tipos básicos de terreno, mas não é básico',
    3: 'teste: CR 305.6 e 305.8: tem dois tipos básicos de terreno, mas não é básico',
  },
});
