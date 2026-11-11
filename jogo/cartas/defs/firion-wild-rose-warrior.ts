// Firion, Wild Rose Warrior
// Equipped creatures you control have haste.
// Whenever a nontoken Equipment you control enters, create a token that's a copy of it, except it has "This
// Equipment's equip abilities cost {2} less to activate." Sacrifice that token at the beginning of the next upkeep.
import {
  and, anthem, chars, controllerOf, copyWithExcept, createTokens, defineAbility, defineCard, delayed, is, lkiObj, nextUpkeepTrigger, on, sacrifice,
  staticAbility, triggered,
} from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { ehEquipada, ehEquipar } from '../equipar.ts';

// a habilidade que a cópia ganha (vira valor copiável dela, CR 707.9b)
const DESCONTO = defineAbility('Firion, Wild Rose Warrior:desconto', staticAbility({
  rules: { abilityCostModifier: (c, _jogador, fonte, def) => (fonte === c.source && ehEquipar(def) ? { reduce: 2 } : null) },
  text: 'As habilidades de equipar deste Equipamento custam {2} a menos para serem ativadas.',
}));

const SACRIFICA = defineAbility('Firion, Wild Rose Warrior:sacrifica', nextUpkeepTrigger(function* (c) {
  const ficha = c.data.ficha as ObjId;
  // só quem controla a ficha pode sacrificá-la (CR 701.21a)
  if (c.g.state.objects[ficha]?.zone === 'battlefield' && controllerOf(c.g, ficha) === c.you) yield* sacrifice(c.g, [ficha]);
}, 'Sacrifique a ficha criada por Firion.'));

export default defineCard({
  name: 'Firion, Wild Rose Warrior',
  faces: [{
    abilities: [
      anthem(and(is.creature, is.yours, (c, id) => ehEquipada(c.g, id)), () => [{ k: 'addKeyword', kw: 'haste' }], 'As criaturas equipadas que você controla têm ímpeto.'),
      triggered(on.enters(and(is.nontoken, is.yours, (c, id) => chars(c.g, id).subtypes.includes('Equipment'))), function* (c) {
        const id = c.event.obj as ObjId;
        // rulings 3 e 4: copia os valores copiáveis (o que ela copia, se for cópia), sem marcadores nem anexos; vale a
        // última informação se ela já saiu do campo (CR 707.4)
        if (!c.g.state.objects[id] && !lkiObj(c.g, id)) return;
        const [ficha] = yield* createTokens(c.g, c.you, { copyOf: copyWithExcept(c.g, id, { addAbilities: [DESCONTO.id!] }) }, 1);
        if (ficha !== undefined) delayed(c, SACRIFICA.id!, { data: { ficha } });
      }, { text: 'Sempre que um Equipamento que não é ficha entra sob o seu controle, crie uma ficha que é uma cópia dele, exceto que ela tem "As habilidades de equipar deste Equipamento custam {2} a menos para serem ativadas". Sacrifique essa ficha no início da próxima manutenção.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 107.3g — fora da pilha, o X do custo de mana conta 0 (motor/chars.ts)',
    2: 'teste: as habilidades de entrar do Equipamento copiado disparam para a ficha (Nettlecyst cria outro Germ)',
    3: 'teste: a ficha copia o Equipamento sem os anexos e com o desconto de {2} em equipar; é sacrificada na próxima manutenção',
    4: 'regra geral: CR 707.3 — a cópia de uma cópia usa os valores copiáveis dela (motor/mecanicas.ts copiableValues)',
  },
});
