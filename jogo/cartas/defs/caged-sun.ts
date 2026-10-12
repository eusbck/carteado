// Caged Sun
// As this artifact enters, choose a color.
// Creatures you control of the chosen color get +1/+1.
// Whenever a land's ability causes you to add one or more mana of the chosen color, add an additional one mana of that
// color.
import { addMana, anthem, asEnters, chars, chooseColor, controllerOf, defineCard, isCreature, isLand, on, staticAbility, triggered } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import type { Color, ManaType } from '../../motor/types.ts';

const cor = (c: SCtx): Color | undefined => c.g.state.objects[c.source]?.choices.cor as Color | undefined;

export default defineCard({
  name: 'Caged Sun',
  faces: [{
    abilities: [
      asEnters(function* (c, ev) { ev.choices.cor = yield* chooseColor(c.g, c.you, 'Caged Sun: escolha uma cor'); }, 'Conforme este artefato entra, escolha uma cor.'),
      anthem((c, id) => { const k = cor(c); return !!k && isCreature(c.g, id) && controllerOf(c.g, id) === c.you && chars(c.g, id).colors.includes(k); },
        () => [{ k: 'pt', p: 1, t: 1 }], 'As criaturas da cor escolhida que você controla recebem +1/+1.'),
      // ruling 1: habilidade de mana desencadeada (CR 605.1b): não usa a pilha; o gancho avisa o pagamento automático
      staticAbility({ rules: { extraManaForPlanning: (c, jogador, fonte, produzida) => { const k = cor(c); return k && jogador === c.you && isLand(c.g, fonte) && produzida.includes(k as ManaType) ? [k as ManaType] : []; } } }),
      triggered(on.custom((e, c) => { const k = cor(c); return !!k && e.type === 'mana' && e.player === c.you && !!c.g.state.objects[e.source] && isLand(c.g, e.source) && e.produced.includes(k as ManaType); }), function* (c) {
        const k = cor(c);
        if (k) addMana(c.g, c.you, [k as ManaType], { source: c.source });
      }, { mana: true, text: 'Sempre que a habilidade de um terreno faz você adicionar uma ou mais manas da cor escolhida, adicione uma mana adicional dessa cor.' }),
    ],
  }],
  rulings: { 1: 'teste: escolhe uma cor; as suas criaturas dessa cor recebem +1/+1 e os seus terrenos dão uma mana a mais dessa cor, sem usar a pilha' },
});