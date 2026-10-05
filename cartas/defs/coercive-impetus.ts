// Coercive Impetus
// Enchant creature
// Enchanted creature gets +1/+1 and is goaded.
// Whenever enchanted creature attacks, you draw a card and lose 1 life.
import { attachedGets, defineCard, draw, goadsEnchanted, loseLife, on, t, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Coercive Impetus',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 1, t: 1 }], 'A criatura encantada recebe +1/+1.'),
      goadsEnchanted(),
      triggered(on.attacks((c, id) => c.g.state.objects[c.source]?.attachedTo === id), function* (c) {
        yield* draw(c.g, c.you, 1);
        loseLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que a criatura encantada ataca, você compra uma carta e perde 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.15 — goad não é habilidade da criatura (gancho da Aura)',
    2: 'regra geral: CR 508.1d — exceções (virada, não pode atacar, enjoo, custos)',
    3: 'regra geral: o goad continua enquanto a Aura está anexada',
    4: 'regra geral: CR 701.15b — goadada por vários, ataca quem não goadou',
    5: 'teste: precisa atacar alguém que não seja quem goadou',
  },
});
