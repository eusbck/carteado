// Gwyllion Hedge-Mage
// When this creature enters, if you control two or more Plains, you may create a 1/1 white Kithkin Soldier creature
// token.
// When this creature enters, if you control two or more Swamps, you may put a -1/-1 counter on target creature.
import { addCounters, controlledBy, createTokens, defineCard, etb, isSubtype, t, tgt, yesNo } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

// ruling 3: cada terreno conta pelos tipos que tem (um terreno Plains Swamp conta para os dois)
const temDois = (tipo: string) => (c: SCtx) => controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, tipo)).length >= 2;

export default defineCard({
  name: 'Gwyllion Hedge-Mage',
  faces: [{
    abilities: [
      // rulings 1 e 4 (CR 603.4): cláusula "se" interveniente, conferida ao disparar e ao resolver; a escolha é na resolução
      etb(function* (c) {
        if (yield* yesNo(c.g, c.you, 'Gwyllion Hedge-Mage: criar uma ficha de criatura Kithkin Soldier 1/1 branca?')) yield* createTokens(c.g, c.you, 'Kithkin Soldier', 1);
      }, { condition: temDois('Plains'), text: 'Quando esta criatura entra, se você controla duas ou mais Plains, você pode criar uma ficha de criatura Kithkin Soldier 1/1 branca.' }),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null && (yield* yesNo(c.g, c.you, 'Gwyllion Hedge-Mage: colocar um marcador -1/-1 na criatura alvo?'))) addCounters(c.g, { kind: 'obj', id }, '-1/-1', 1, c.you);
      }, { condition: temDois('Swamp'), targets: [t.creature()], text: 'Quando esta criatura entra, se você controla dois ou mais Swamps, você pode colocar um marcador -1/-1 na criatura alvo.' }),
    ],
  }],
  rulings: {
    1: 'teste: sem dois terrenos do tipo, a habilidade não dispara',
    2: 'regra geral: CR 603.3b — os dois gatilhos disparam juntos e você escolhe a ordem (motor/stack.ts putTriggersOnStack)',
    3: 'regra geral: CR 205.3i — cada terreno conta pelos tipos de terreno que tem (cartas/defs/gwyllion-hedge-mage.ts)',
    4: 'teste: com duas Plains e dois Swamps, cria o Kithkin Soldier e põe um marcador -1/-1 na criatura alvo',
  },
});