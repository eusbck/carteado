// Inalla, Archmage Ritualist
// Eminence — Whenever another nontoken Wizard you control enters, if Inalla is in the command zone or on the
// battlefield, you may pay {1}. If you do, create a token that's a copy of that Wizard. The token gains haste. Exile it at
// the beginning of the next end step.
// Tap five untapped Wizards you control: Target player loses 7 life.
import {
  activated, chars, controllerOf, copiableValues, createTokens, defineCard, delayed, loseLife, mayPay, nameOf, t, tgtPlayer, triggered, withDuration,
} from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { EXILA_NO_FIM } from '../cedh.ts';

const NOME = 'Inalla, Archmage Ritualist';
const ehMago = (ch: { subtypes: string[] } | null | undefined) => !!ch?.subtypes.includes('Wizard');

export default defineCard({
  name: NOME,
  faces: [{
    abilities: [
      // eminência (CR 207.2c): o gatilho funciona no campo e na zona de comando (CR 113.6)
      triggered({
        kind: 'event',
        match: (e, c) => {
          if (e.type !== 'zone' || e.to !== 'battlefield' || e.token || e.obj === c.source) return false;
          const o = c.g.state.objects[e.obj];
          return !!o && !o.isToken && controllerOf(c.g, e.obj) === c.you && ehMago(chars(c.g, e.obj)) ? { mago: e.obj } : false;
        },
      }, function* (c) {
        const g = c.g;
        // rulings 10-11: Inalla precisa continuar na mesma zona (campo ou comando) quando a habilidade resolve
        const fonte = g.state.objects[c.source];
        if (!fonte || (fonte.zone !== 'battlefield' && fonte.zone !== 'command')) return;
        const mago = c.event.mago as ObjId;
        // ruling 1: paga {1} uma vez só; ruling 7: pode pagar mesmo que o Mago já tenha saído (última informação)
        if (!(yield* mayPay(c, c.you, '{1}', `criar uma cópia de ${nameOf(g, mago)} (Inalla)`))) return;
        // rulings 3-5: valores copiáveis (o que ele copiava, se copiava algo; X = 0)
        const [ficha] = yield* createTokens(g, c.you, { copyOf: copiableValues(g, mago) }, 1);
        if (ficha === undefined) return;
        withDuration(c, [ficha], [{ k: 'addKeyword', kw: 'haste' }], { kind: 'whileOnBattlefield', obj: ficha });
        delayed(c, EXILA_NO_FIM, { data: { obj: ficha } });
      }, {
        zones: ['battlefield', 'command'],
        condition: (c) => { const o = c.g.state.objects[c.source]; return !!o && (o.zone === 'battlefield' || o.zone === 'command'); },
        text: 'Eminência — Sempre que outro Mago que não é ficha entra sob o seu controle, se Inalla estiver na zona de comando ou no campo, você pode pagar {1}. Se fizer isso, crie uma ficha que é uma cópia desse Mago. A ficha ganha ímpeto. Exile-a no início da próxima etapa final.',
      }),
      // ruling 9: vira quaisquer cinco Magos desvirados, inclusive os com enjoo e a própria Inalla (não é {T})
      activated([{ k: 'tapCreatures', n: 5, includeSelf: true, filter: (c, id) => ehMago(chars(c.g, id)), label: 'Magos desvirados' }], function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) loseLife(c.g, p, 7, c.source);
      }, { targets: [t.player()], text: 'Vire cinco Magos desvirados que você controla: O jogador alvo perde 7 de vida.' }),
    ],
  }],
  rulings: {
    1: 'teste: paga {1} e cria uma cópia com ímpeto, exilada no início da próxima etapa final',
    2: 'regra geral: CR 603.6a, 603.10 — entrando junto com outros Magos, a habilidade dispara para cada um deles (motor/triggers.ts)',
    3: 'regra geral: CR 707.2 — a ficha copia só os valores copiáveis (motor/mecanicas.ts copiableValues)',
    4: 'regra geral: CR 107.3 — X de uma cópia vale 0 (motor/chars.ts)',
    5: 'regra geral: CR 707.3 — cópia de algo que copiava outra coisa vira essa outra coisa (motor/mecanicas.ts copiableValues)',
    6: 'regra geral: CR 603.6a — as habilidades de entrar da carta copiada disparam para a ficha (cartas/defs/clone-legion.test.ts)',
    7: 'teste: o Mago que já saiu do campo ainda é copiado pela última informação',
    8: 'regra geral: CR 704.5j, 603.3 — as habilidades da cópia lendária disparam antes da regra da lenda (motor/sba.ts)',
    9: 'teste: vira cinco Magos, inclusive com enjoo de invocação, e o alvo perde 7 de vida',
    10: 'teste: da zona de comando também dispara; fichas não disparam',
    11: 'teste: se Inalla muda de zona antes de a habilidade resolver, nada acontece',
  },
});
