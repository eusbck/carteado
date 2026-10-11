// Shiny Impetus
// Enchant creature
// Enchanted creature gets +2/+2 and is goaded. (It attacks each combat if able and attacks a player other than you if
// able.)
// Whenever enchanted creature attacks, you create a Treasure token. (It's an artifact with "{T}, Sacrifice this token: Add
// one mana of any color.")
import { attachedGets, createTokens, defineCard, goadsEnchanted, on, t, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Shiny Impetus',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 2, t: 2 }], 'A criatura encantada recebe +2/+2.'),
      // rulings 1-5: goadada por você, o controlador da Aura (motor: exigências de ataque, CR 701.15b)
      goadsEnchanted(),
      // ruling 6: quem cria o Treasure é você, não o controlador da criatura
      triggered(on.custom((e, c) => e.type === 'attackers' && e.attackers.some((a) => a.obj === c.g.state.objects[c.source]?.attachedTo)), function* (c) {
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { text: 'Sempre que a criatura encantada ataca, você cria uma ficha de Treasure.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 508.1d — a exigência só vale se a criatura puder atacar, e custos de ataque não são obrigatórios (motor/combat.ts maxObeyed)',
    2: 'regra geral: CR 701.15b — ataca um jogador que não a goadou se puder; se não puder, ataca outro alvo ou não ataca (motor/combat.ts requirements)',
    3: 'regra geral: CR 701.15b — goadada é uma designação, não uma habilidade da criatura (motor/mecanicas.ts goadsEnchanted)',
    4: 'regra geral: CR 701.15b — continua goadada enquanto a Aura estiver nela, em combates adicionais e sob outro controlador',
    5: 'regra geral: CR 701.15b, 508.1d — goadada por vários jogadores, cumpre o máximo de exigências (motor/combat.ts requiredTargets)',
    6: 'teste: a criatura encantada do oponente recebe +2/+2, fica goadada e, quando ataca, você cria um Treasure',
  },
});
