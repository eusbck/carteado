// Thousand-Faced Shadow
// Ninjutsu {2}{U}{U} ({2}{U}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield
// from your hand tapped and attacking.)
// Flying
// When this creature enters from your hand, if it's attacking, create a token that's a copy of another target attacking
// creature. The token enters tapped and attacking.
import { copiableValues, defineCard, isAttacking, keyword, ninjutsu, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';
import { NINJUTSU } from '../ninjas.ts';
import { escolheAtacado } from '../viloes.ts';

export default defineCard({
  name: 'Thousand-Faced Shadow',
  faces: [{
    abilities: [
      ninjutsu('{2}{U}{U}'),
      keyword('flying'),
      triggered(on.custom((e, c) => e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source && e.from === 'hand'), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // rulings 3-6: só os valores copiáveis; ruling 1: você escolhe quem a ficha ataca
        const modelo = copiableValues(c.g, id);
        const alvo = yield* escolheAtacado(c, 'Thousand-Faced Shadow');
        yield* putOntoBattlefield(c.g, [{ controller: c.you, token: { copyOf: modelo }, tapped: true, attacking: alvo ?? undefined }], 'token');
      }, {
        // CR 603.4: "se estiver atacando" é verificado ao disparar e ao resolver
        condition: (c) => isAttacking(c.g, c.source),
        targets: [t.creature((c, id) => id !== c.source && isAttacking(c.g, id), 'outra criatura atacante alvo')],
        text: 'Quando esta criatura entra vinda da sua mão, se estiver atacando, crie uma ficha que é uma cópia de outra criatura atacante alvo. A ficha entra virada e atacando.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: entra pelo ninjutsu e copia outra atacante; a ficha entra virada e atacando',
    2: 'regra geral: CR 508.4 — a ficha não foi declarada atacante (motor/combat.ts)',
    3: 'regra geral: CR 707.2 — copia só os valores copiáveis (motor/mecanicas.ts copiableValues)',
    4: 'regra geral: CR 707.2 — copia só os valores copiáveis (motor/mecanicas.ts copiableValues)',
    5: 'regra geral: CR 707.3 — se a criatura copia outra, a ficha copia o que ela copia (motor/mecanicas.ts copiableValues)',
    6: 'regra geral: CR 707.2, 111.4 — ficha copiada usa os valores originais da ficha (motor/mecanicas.ts copiableValues)',
    7: 'regra geral: CR 707.6 — gatilhos e substituições de entrar da criatura copiada funcionam (motor/actions.ts putOntoBattlefield)',
    8: NINJUTSU.depoisDosBloqueios,
    9: NINJUTSU.revela,
    10: NINJUTSU.mesmoJogador,
    11: NINJUTSU.naoDeclarada,
    12: NINJUTSU.etapas,
    13: NINJUTSU.primeiroGolpe,
    14: 'não se aplica: piada da carta (sem regra)',
  },
});
