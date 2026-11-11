// Cloud Key
// As this artifact enters, choose artifact, creature, enchantment, instant, or sorcery.
// Spells you cast of the chosen type cost {1} less to cast.
import { asEnters, chooseItems, defineCard, staticAbility } from '../../motor/api.ts';

const TIPOS = ['Artifact', 'Creature', 'Enchantment', 'Instant', 'Sorcery'];
const PT: Record<string, string> = { Artifact: 'artefato', Creature: 'criatura', Enchantment: 'encantamento', Instant: 'instantânea', Sorcery: 'feitiço' };

export default defineCard({
  name: 'Cloud Key',
  faces: [{
    abilities: [
      asEnters(function* (c, ev) {
        const [tipo] = yield* chooseItems(c.g, c.you, 'Cloud Key: escolha um tipo de carta', TIPOS.map((x) => ({ id: x, label: PT[x] })), 1, 1);
        ev.choices.cardType = tipo;
      }, 'Conforme este artefato entra, escolha artefato, criatura, encantamento, instantânea ou feitiço.'),
      staticAbility({
        rules: {
          costModifier: (c, spell) => {
            const tipo = c.g.state.objects[c.source]?.choices.cardType as string | undefined;
            return spell.controller === c.you && !!tipo && spell.chars.types.includes(tipo) ? { reduce: 1 } : null;
          },
        },
        text: 'As mágicas do tipo escolhido que você conjura custam {1} a menos para conjurar.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 601.2f — reduz só a parte genérica do custo (motor/stack.ts)',
    2: 'regra geral: CR 601.2f — uma mágica de artefato e criatura com os dois tipos escolhíveis recebe a redução uma vez',
  },
});
