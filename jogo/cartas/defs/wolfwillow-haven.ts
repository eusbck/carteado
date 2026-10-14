// Wolfwillow Haven
// Enchant land
// Whenever enchanted land is tapped for mana, its controller adds an additional {G}.
// {4}{G}, Sacrifice this Aura: Create a 2/2 green Wolf creature token. Activate only during your turn.
import { activated, addMana, controllerOf, createTokens, defineCard, on, staticAbility, t, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Wolfwillow Haven',
  faces: [{
    enchant: t.land(undefined, 'terreno'),
    abilities: [
      // avisa o pagamento automático da mana a mais
      staticAbility({
        rules: {
          extraManaForPlanning: (c, jogador, fonte, _produzida, virou) => {
            const terreno = c.g.state.objects[c.source]?.attachedTo;
            return virou && fonte === terreno && controllerOf(c.g, fonte) === jogador ? ['G'] : [];
          },
        },
      }),
      // habilidade de mana desencadeada (CR 605.1b): não usa a pilha; a mana vai para quem controla o terreno
      triggered(on.custom((e, c) => e.type === 'mana' && !!e.tappedForMana && e.source === c.g.state.objects[c.source]?.attachedTo ? { quem: e.player } : false), function* (c) {
        const terreno = c.g.state.objects[c.source]?.attachedTo;
        const quem = terreno !== null && terreno !== undefined && c.g.state.objects[terreno] ? controllerOf(c.g, terreno) : c.event.quem as number;
        addMana(c.g, quem, ['G'], { source: c.source });
      }, { mana: true, text: 'Sempre que o terreno encantado é virado para gerar mana, o controlador dele adiciona {G} a mais.' }),
      activated('{4}{G}, Sacrifice this Aura', function* (c) { yield* createTokens(c.g, c.you, 'Wolf', 1); }, {
        condition: (c) => c.g.state.turn.active === c.you,
        text: '{4}{G}, Sacrifique esta Aura: Crie uma ficha de criatura Wolf verde 2/2. Ative somente durante o seu turno.',
      }),
    ],
  }],
  rulings: {},
});
