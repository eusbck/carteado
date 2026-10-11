// Helm of the Host
// At the beginning of combat on your turn, create a token that's a copy of equipped creature, except the token isn't
// legendary. That token gains haste.
// Equip {5}
import { addEffect, copyWithExcept, createTokens, defineCard, equip, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Helm of the Host',
  faces: [{
    abilities: [
      triggered(on.beginCombat('you'), function* (c) {
        const s = c.g.state;
        // ruling 8: sem criatura equipada não há ficha; se o Helm saiu do campo, vale a última criatura equipada
        const equipada = (s.objects[c.source] ?? s.lki[c.source]?.obj)?.attachedTo;
        if (equipada === null || equipada === undefined || (!s.objects[equipada] && !s.lki[equipada])) return;
        // rulings 1-4: os valores copiáveis, e "não é lendária" passa a fazer parte deles
        const [ficha] = yield* createTokens(c.g, c.you, { copyOf: copyWithExcept(c.g, equipada, { legendary: false }) }, 1);
        // ruling 5: o ímpeto é um efeito sem prazo sobre a ficha, e não é copiável
        if (ficha !== undefined) addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: ficha }, affected: [ficha], mods: [{ k: 'addKeyword', kw: 'haste' }] });
      }, { text: 'No início do combate no seu turno, crie uma ficha que é uma cópia da criatura equipada, exceto que a ficha não é lendária. Essa ficha ganha ímpeto.' }),
      equip('{5}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.3 — a cópia de uma ficha usa as características que o efeito que a criou definiu (motor/mecanicas.ts copiableValues)',
    2: 'regra geral: CR 707.3 — a cópia de uma cópia usa os valores copiáveis dela (motor/mecanicas.ts copiableValues)',
    3: 'regra geral: CR 707.2 — a ficha copia só os valores copiáveis, sem marcadores nem Equipamentos (motor/mecanicas.ts copiableValues)',
    4: 'teste: no início do combate no seu turno, cria uma cópia não lendária da criatura equipada, com ímpeto',
    5: 'regra geral: CR 707.2 — o ímpeto é um efeito sobre a ficha, não um valor copiável (cartas/defs/helm-of-the-host.ts)',
    6: 'regra geral: CR 107.3g — fora da pilha, o X do custo de mana conta 0 (motor/chars.ts)',
    7: 'regra geral: CR 603.6a — as habilidades de entrar da criatura copiada disparam para a ficha (motor/triggers.ts)',
    8: 'teste: sem criatura equipada, nenhuma ficha é criada',
  },
});