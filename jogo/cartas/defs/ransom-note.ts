// Ransom Note
// When this artifact enters, surveil 1.
// {2}, Sacrifice this artifact: Choose one —
// • Cloak the top card of your library.
// • Goad target creature.
// • Draw a card.
import { activated, defineCard, draw, etb, goad, lookAndArrange, modal, t, tgt } from '../../motor/api.ts';
import { encobrir } from '../culpa.ts';

export default defineCard({
  name: 'Ransom Note',
  faces: [{
    abilities: [
      etb(function* (c) { yield* lookAndArrange(c.g, c.you, 1, 'surveil'); }, { text: 'Quando este artefato entra, vigiar 1.' }),
      activated('{2}, Sacrifice this artifact', function* () { /* modos */ }, {
        modes: modal(1, 1, [
          { text: 'Encubra a carta do topo do seu grimório', *effect(c) { yield* encobrir(c.g, c.you); } },
          { text: 'Goade a criatura alvo', targets: [t.creature()], *effect(c) { const id = tgt(c); if (id !== null) goad(c.g, id, c.you); } },
          { text: 'Compre uma carta', *effect(c) { yield* draw(c.g, c.you, 1); } },
        ]),
        text: '{2}, Sacrifique este artefato: Escolha um — encubra a carta do topo do seu grimório; ou goade a criatura alvo; ou compre uma carta.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: encobrir: a carta do topo entra virada para baixo, 2/2 sem nome, com resguardo {2}',
    2: 'teste: a encoberta que é carta de criatura vira para cima pagando o custo de mana dela; o resguardo some',
    3: 'não se aplica: o deck não tem cartas com disfarce; metamorfose segue a regra de cada carta (motor/conjurar-alternativo.ts)',
    4: 'regra geral: CR 701.58b — virar para cima a encoberta olha a carta (motor/mecanicas.ts manifestFaceUpCost), não as habilidades',
    5: 'regra geral: CR 708.2 — de face para baixo não transforma; virada para cima, fica com a frente (motor/mecanicas.ts turnFaceUp)',
    6: 'regra geral: CR 708.5 — o controlador vê a carta virada para baixo (motor/view.ts)',
    7: 'não se aplica: o deck não tem cartas com disfarce',
    8: 'regra geral: CR 708.8 — virar para cima não é entrar no campo',
    9: 'regra geral: CR 708.2a — de face para baixo não tem nome',
    10: 'regra geral: CR 708.8 — é a mesma permanente; alvos e anexos continuam (motor/mecanicas.ts turnFaceUp)',
    11: 'regra geral: CR 708.8 — virar para cima não muda se está virada (tapped) ou não',
    12: 'regra geral: CR 708.9 — saindo do campo, a carta é revelada (motor/actions.ts)',
    13: 'regra geral: CR 708.6 — as viradas para baixo se distinguem na mesa pela ordem e pela marcação de encoberta (data.encoberta)',
    14: 'teste: a encoberta que é instantânea ou feitiço não pode ser virada para cima',
  },
});
