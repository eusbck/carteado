// Secluded Courtyard
// As this land enters, choose a creature type.
// {T}: Add {C}.
// {T}: Add one mana of any color. Spend this mana only to cast a creature spell of the chosen type or activate an
// ability of a creature source of the chosen type.
import { asEnters, chars, chooseCreatureType, controllerOf, defineCard, defineFn, isCreature, mana, nameOf, type G } from '../../motor/api.ts';

const NOME = 'Secluded Courtyard';

// CR 106.6: mana com restrição de gasto. A restrição do motor recebe só a finalidade do pagamento (não a fonte da mana),
// então ela confere o tipo escolhido pelo Secluded Courtyard que o jogador que paga controla. No Commander (singleton) há
// no máximo um por jogador. Se ele saiu do campo depois de produzir a mana, a mana que sobrou não tem tipo para conferir.
const RESTRICAO = 'Secluded Courtyard:tipoEscolhido';
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) => {
  if (purpose.kind === 'effect' || purpose.obj === undefined || !g.state.objects[purpose.obj]) return false;
  const quem = controllerOf(g, purpose.obj);
  const tipos = g.state.zones.battlefield
    .filter((id) => nameOf(g, id) === NOME && controllerOf(g, id) === quem)
    .map((id) => g.state.objects[id].choices.tipo as string | undefined)
    .filter((t): t is string => !!t);
  // mágica de criatura do tipo, ou habilidade de uma fonte que é criatura do tipo
  return isCreature(g, purpose.obj) && tipos.some((t) => chars(g, purpose.obj!).subtypes.includes(t));
});

export default defineCard({
  name: NOME,
  faces: [{ abilities: [
    // CR 614.1c e 614.12a: o tipo é escolhido antes de entrar
    asEnters(function* (c, ev) {
      ev.choices.tipo = yield* chooseCreatureType(c.g, c.you, 'Secluded Courtyard: escolha um tipo de criatura');
    }, 'Ao entrar, escolha um tipo de criatura.'),
    mana('C'),
    mana('any', {
      restriction: RESTRICAO,
      text: '{T}: Adicione uma mana de qualquer cor. Gaste essa mana só para conjurar uma mágica de criatura do tipo escolhido ou ativar uma habilidade de uma fonte que seja criatura do tipo escolhido.',
    }),
  ] }],
  rulings: {
    1: 'teste: sem tipo escolhido, a mana colorida não paga nada',
  },
});
