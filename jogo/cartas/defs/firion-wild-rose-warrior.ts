// Firion, Wild Rose Warrior
// Equipped creatures you control have haste.
// Whenever a nontoken Equipment you control enters, create a token that's a copy of it, except it has "This
// Equipment's equip abilities cost {2} less to activate." Sacrifice that token at the beginning of the next upkeep.
import { and, anthem, chars, controllerOf, copyWithExcept, createTokens, defineAbility, defineCard, delayed, is, nextUpkeepTrigger, on, sacrifice, staticAbility, triggered } from '../../motor/api.ts';
import { ehEquipar, equipada } from '../armaria.ts';

const BARATO = defineAbility('Firion, Wild Rose Warrior:equipar-barato', staticAbility({
  rules: { abilityCostModifier: (c, _p, fonte, def) => (fonte === c.source && ehEquipar(def) ? { reduce: 2 } : null) },
  text: 'As habilidades de equipar deste Equipamento custam {2} a menos para serem ativadas.',
}));

const SACRIFICA = defineAbility('Firion, Wild Rose Warrior:sacrifica', nextUpkeepTrigger(function* (c) {
  const id = c.data.ficha as number | undefined;
  if (id !== undefined && c.g.state.objects[id]?.zone === 'battlefield') yield* sacrifice(c.g, [id]);
}, 'Sacrifique a ficha no início da próxima manutenção.'));

export default defineCard({
  name: 'Firion, Wild Rose Warrior',
  faces: [{
    abilities: [
      anthem(and(is.creature, is.yours, (c, id) => equipada(c.g, id)), () => [{ k: 'addKeyword', kw: 'haste' }], 'As criaturas equipadas que você controla têm ímpeto.'),
      triggered(on.enters((c, id) => controllerOf(c.g, id) === c.you && !c.g.state.objects[id]?.isToken && chars(c.g, id).subtypes.includes('Equipment')), function* (c) {
        const modelo = (c.event as { obj?: number }).obj;
        if (modelo === undefined || !c.g.state.objects[modelo]) return;
        // rulings 3 e 4: copia os valores copiáveis (o que ele estiver copiando), com a exceção
        const [ficha] = yield* createTokens(c.g, c.you, { copyOf: copyWithExcept(c.g, modelo, { addAbilities: [BARATO.id!] }) }, 1);
        if (ficha !== undefined && ficha !== null) delayed(c, SACRIFICA.id!, { data: { ficha } });
      }, { text: 'Sempre que um Equipamento que não seja ficha entra sob o seu controle, crie uma ficha que é cópia dele, exceto que tem "As habilidades de equipar deste Equipamento custam {2} a menos". Sacrifique essa ficha no início da próxima manutenção.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.2 — X do custo copiado vale 0 (motor/criaturas.ts copiableValues)',
    2: 'regra geral: CR 707.2 — a ficha tem as habilidades de "quando entra" do original e elas disparam (motor/state.ts)',
    3: 'teste: cria a cópia, com o equipar mais barato, e ela é sacrificada na próxima manutenção',
    4: 'regra geral: CR 707.3 — se o original copia outra coisa, a ficha copia o mesmo (motor/criaturas.ts copyWithExcept)',
  },
});
