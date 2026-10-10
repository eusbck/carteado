// Steel Hellkite
// Flying
// {2}: This creature gets +1/+0 until end of turn.
// {X}: Destroy each nonland permanent with mana value X whose controller was dealt combat damage by this creature this turn. Activate only once each turn.
import { activated, combatDamagePlayers, controllerOf, defineCard, destroy, isLand, keyword, manaValue, permanentsMatching, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: "Steel Hellkite",
  faces: [{
    abilities: [keyword('flying'),
    activated('{2}', function*(c) { if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p: 1, t: 0 }]); }, { text: '{2}: recebe +1/+0 até o fim do turno.' }),
    activated('{X}', function*(c) {
      const victims = combatDamagePlayers(c.g, c.source);
      yield* destroy(c.g, permanentsMatching(c.g, (id) => !isLand(c.g, id) && manaValue(c.g, id) === c.x && victims.includes(controllerOf(c.g, id))));
    }, { oncePerTurn: true, text: '{X}: destrua cada permanente não terreno de valor de mana X de jogadores que receberam dano de combate desta criatura neste turno. Ative só uma vez por turno.' }),
    ]
  }],
  rulings: {
    "1": "teste: dano de combate identifica os jogadores; destrói só permanentes não terreno com valor de mana exatamente X.",
    "2": "CR 608.2h: controle e permanentes são conferidos na resolução, não no momento do dano.",
    "3": "teste: pode ativar sem ter causado dano; a lista de jogadores atingidos é vazia e nada é destruído.",
    "4": "teste: X=0 destrói fichas e outros permanentes não terreno com valor de mana zero.",
    "5": "CR 202.3: valor de mana é calculado pelo custo impresso, sem considerar as cores da mana gasta.",
    "6": "CR 707.2: manaValue consulta as características copiadas, inclusive o custo de mana do modelo.",
    "7": "CR 202.3: custos alternativos/adicionais não alteram o valor de mana de um permanente.",
    "8": "CR 107.3g, 202.3e: X vale zero fora da pilha.",
    "9": "CR 202.3a: ficha sem custo de mana tem valor zero, salvo valores copiados."
  },
});
