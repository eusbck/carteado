// Clone Legion
// For each creature target player controls, create a token that's a copy of that creature.
import { copiableValues, creaturesOf, defineCard, putOntoBattlefield, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Clone Legion',
  faces: [{
    spell: {
      targets: [t.player()],
      *effect(c) {
        const p = tgtPlayer(c, 0);
        if (p === null) return;
        const criaturas = creaturesOf(c.g, p);
        if (!criaturas.length) return;
        // ruling 2: todas as fichas entram ao mesmo tempo; rulings 4-7 (CR 707.2): só os valores copiáveis
        yield* putOntoBattlefield(c.g, criaturas.map((id) => ({ controller: c.you, token: { copyOf: copiableValues(c.g, id) } })), 'token');
      },
    },
  }],
  rulings: {
    1: 'teste: as habilidades de entrar das criaturas copiadas disparam para as fichas',
    2: 'teste: cria uma ficha cópia de cada criatura do jogador alvo, todas sob o seu controle',
    3: 'regra geral: CR 708.2a, 707.2 — a cópia de uma criatura virada para baixo é uma 2/2 sem nome (motor/mecanicas.ts copiableValues)',
    4: 'regra geral: CR 707.2 — copiando uma ficha, valem as características dadas pelo efeito que a criou (motor/mecanicas.ts copiableValues)',
    5: 'regra geral: CR 707.3 — copiando uma cópia, a ficha entra como o que a criatura copiava (motor/mecanicas.ts copiableValues)',
    6: 'regra geral: CR 107.3 — X de uma cópia de permanente vale 0 (motor/chars.ts)',
    7: 'teste: cria uma ficha cópia de cada criatura do jogador alvo, todas sob o seu controle',
    8: 'teste: copiando as suas próprias lendárias, a regra da lenda se aplica',
  },
});
