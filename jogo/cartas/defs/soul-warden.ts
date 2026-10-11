// Soul Warden
// Whenever another creature enters, you gain 1 life.
import { and, defineCard, gainLife, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Soul Warden',
  faces: [{
    abilities: [
      // ruling 1: de qualquer jogador; entrando junto com outras criaturas, dispara para cada uma delas
      triggered(on.enters(and(is.creature, is.other)), function* (c) { gainLife(c.g, c.you, 1, c.source); }, { text: 'Sempre que outra criatura entra, você ganha 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.6a — as permanentes que entram juntas veem umas às outras entrar (motor/triggers.ts)',
  },
});