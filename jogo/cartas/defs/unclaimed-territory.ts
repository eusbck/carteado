// Unclaimed Territory
// As this land enters, choose a creature type.
// {T}: Add {C}.
// {T}: Add one mana of any color. Spend this mana only to cast a creature spell of the chosen type.
import { asEnters, chars, chooseCreatureType, defineAbility, defineCard, defineFn, mana, selfGets, type G } from '../../motor/api.ts';
import { registry } from '../../motor/defs.ts';

/**
 * A restrição de gasto (CR 106.6) depende do tipo escolhido por este terreno, e a restrição da mana é um id fixo da
 * habilidade. Por isso cada tipo escolhido tem sua própria habilidade de mana concedida ao terreno (CR 613.1f), com id
 * estável por tipo, registrada na primeira vez que for usada.
 */
function manaDoTipo(tipo: string): string {
  const id = `Unclaimed Territory:mana:${tipo}`;
  if (!registry.abilities.has(id)) {
    const restricao = `Unclaimed Territory:restricao:${tipo}`;
    defineFn(restricao, (g: G, purpose: { kind: string; obj?: number }) => {
      if (purpose.kind !== 'spell' || purpose.obj === undefined || !g.state.objects[purpose.obj]) return false;
      const c = chars(g, purpose.obj);
      return c.types.includes('Creature') && c.subtypes.includes(tipo);
    });
    defineAbility(id, mana('any', { restriction: restricao, text: `{T}: Adicione uma mana de qualquer cor. Gaste essa mana apenas para conjurar uma mágica de criatura do tipo escolhido (${tipo}).` }));
  }
  return id;
}

export default defineCard({
  name: 'Unclaimed Territory',
  faces: [{
    abilities: [
      // CR 614.12a: o tipo é escolhido antes de entrar e fica gravado no objeto (CR 607.2d); ruling 1: só tipos de
      // criatura existentes (chooseCreatureType)
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, c.you, 'Unclaimed Territory: escolha um tipo de criatura');
      }, 'Ao entrar, escolha um tipo de criatura.'),
      mana('C'),
      selfGets((c) => {
        const tipo = c.g.state.objects[c.source]?.choices.creatureType as string | undefined;
        return tipo ? [{ k: 'addAbility', id: manaDoTipo(tipo) }] : [];
      }, '{T}: Adicione uma mana de qualquer cor. Gaste essa mana apenas para conjurar uma mágica de criatura do tipo escolhido.'),
    ],
  }],
  rulings: {
    1: 'teste: só tipos de criatura existentes aparecem na escolha',
  },
});
