// Serra's Emissary
// Flying
// As this creature enters, choose a card type.
// You and creatures you control have protection from the chosen card type.
import { asEnters, chooseItems, controllerOf, defineCard, isCreature, keyword, staticAbility, type SCtx } from '../../motor/api.ts';

// ruling 1: só tipos de carta (CR 205.2a) — os que aparecem numa partida normal; nem supertipos nem subtipos
const TIPOS: [string, string][] = [
  ['Artifact', 'Artefato'], ['Battle', 'Batalha'], ['Creature', 'Criatura'], ['Enchantment', 'Encantamento'],
  ['Instant', 'Instantânea'], ['Kindred', 'Tribal (kindred)'], ['Land', 'Terreno'], ['Planeswalker', 'Planeswalker'],
  ['Sorcery', 'Feitiço'],
];

const escolhido = (c: SCtx) => c.g.state.objects[c.source]?.choices.cardType as string | undefined;

export default defineCard({
  name: "Serra's Emissary",
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 2: a escolha é uma substituição ao entrar (CR 614.12), sem pilha: já entra com a proteção
      asEnters(function* (c, ev) {
        const [tipo] = yield* chooseItems(c.g, c.you, "Serra's Emissary: escolha um tipo de carta", TIPOS.map(([id, label]) => ({ id, label })), 1, 1);
        ev.choices.cardType = tipo;
      }, 'Ao entrar, escolha um tipo de carta.'),
      // CR 702.16a: proteção contra um tipo de carta vale para permanentes desse tipo e para fontes desse tipo fora do campo;
      // o jogador com proteção não pode ser alvo dessas fontes nem sofrer dano delas (CR 702.16b, 702.16e)
      staticAbility({
        affects: (c, o) => !!escolhido(c) && isCreature(c.g, o.id) && controllerOf(c.g, o.id) === c.you,
        mods: (c) => [{ k: 'addKeyword', kw: 'protection', param: `type:${escolhido(c)}` }],
        rules: { playerProtection: (c, p) => { const tipo = escolhido(c); return p === c.you && tipo ? [`type:${tipo}`] : []; } },
        text: 'Você e as criaturas que você controla têm proteção contra o tipo de carta escolhido.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a escolha oferece só os nove tipos de carta',
    2: 'teste: a escolha é feita ao entrar, sem pilha: ninguém responde antes da proteção',
  },
});
