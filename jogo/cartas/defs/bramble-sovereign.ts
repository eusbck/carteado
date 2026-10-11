// Bramble Sovereign
// Whenever another nontoken creature enters, you may pay {1}{G}. If you do, that creature's controller creates a token
// that's a copy of that creature.
import { and, copiableValues, createTokens, defineCard, is, mayPay, nameOf, on, triggered } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Bramble Sovereign',
  faces: [{
    abilities: [
      // de qualquer jogador; "o controlador dessa criatura" é quem a controlava quando ela entrou
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && and(is.creature, is.nontoken, is.other)(c, e.obj) ? { obj: e.obj, controlador: e.controller } : false)), function* (c) {
        const id = c.event.obj as ObjId;
        const quem = c.event.controlador as PlayerId;
        const nome = c.g.state.objects[id] ? nameOf(c.g, id) : (c.g.state.lki[id]?.chars.name ?? 'a criatura');
        // ruling 1: paga uma vez só por resolução
        if (!(yield* mayPay(c, c.you, '{1}{G}', `${c.g.state.players[quem].name} criar uma cópia de ${nome}`))) return;
        // rulings 2-4 e 6: só os valores copiáveis; se a criatura já saiu, os da última vez em que esteve no campo
        yield* createTokens(c.g, quem, { copyOf: copiableValues(c.g, id) }, 1);
      }, { text: 'Sempre que outra criatura que não é ficha entra, você pode pagar {1}{G}. Se pagar, o controlador dessa criatura cria uma ficha que é uma cópia dela.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2 — o custo opcional é pago uma vez por resolução (motor/efeitos.ts mayPay)',
    2: 'teste: pagando {1}{G}, o controlador da criatura que entrou cria uma cópia dela, sem os marcadores',
    3: 'regra geral: CR 707.3 — a cópia de uma cópia usa os valores copiáveis dela (motor/mecanicas.ts copiableValues)',
    4: 'regra geral: CR 107.3g — fora da pilha, o X do custo de mana conta 0 (motor/chars.ts)',
    5: 'regra geral: CR 603.6a — as habilidades de entrar da criatura copiada disparam para a ficha (motor/triggers.ts)',
    6: 'regra geral: CR 608.2h — se a criatura já saiu do campo, vale a última informação conhecida (motor/mecanicas.ts copiableValues)',
  },
});