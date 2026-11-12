// Drivnod, Carnage Dominus
// If a creature dying causes a triggered ability of a permanent you control to trigger, that ability triggers an
// additional time.
// {B/P}{B/P}, Exile three creature cards from your graveyard: Put an indestructible counter on Drivnod. ({B/P} can be
// paid with either {B} or 2 life.)
import { activated, addCounters, defineCard, disparoDePermanente, is, morteCausouDisparo, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Drivnod, Carnage Dominus',
  faces: [{
    abilities: [
      staticAbility({
        // ruling 8: vale também quando Drivnod morre junto (olha para trás, motor/morte-dispara.ts)
        lookBack: true,
        rules: {
          // rulings 1, 3-6: a morte (ir do campo para o cemitério) é o evento que dispara; ruling 2: dispara de novo, com
          // escolhas próprias; ruling 9: cada Drivnod soma uma vez
          extraTriggers: (c, tr) => (tr.controller === c.you && disparoDePermanente(c.g, tr) && morteCausouDisparo(c.g, tr) ? 1 : 0),
        },
        text: 'Se uma criatura morrer e isso fizer disparar uma habilidade desencadeada de um permanente que você controla, essa habilidade dispara uma vez a mais.',
      }),
      activated([{ k: 'mana', cost: '{B/P}{B/P}' }, { k: 'exileFromGraveyard', n: 3, filter: is.creature }], function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'indestructible', 1, c.you);
      }, { text: '{B/P}{B/P}, Exile três cartas de criatura do seu cemitério: Coloque um marcador de indestrutível em Drivnod. ({B/P} pode ser pago com {B} ou 2 de vida.)' }),
    ],
  }],
  rulings: {
    1: 'teste: o gatilho de "quando morre" da própria criatura dispara duas vezes',
    2: 'teste: cada disparo escolhe o alvo separado',
    3: 'regra geral: o evento de ir do campo para o cemitério conta (motor/morte-dispara.ts ehMorteDeCriatura)',
    4: 'regra geral: "sai do campo" morrendo é o mesmo evento de mudança de zona (motor/morte-dispara.ts)',
    5: 'teste: "sempre que você sacrifica" não dispara a mais',
    6: 'regra geral: CR 603.10a — a criatura vista como estava no campo (motor/morte-dispara.ts, pela última informação)',
    7: 'regra geral: CR 603.10a — o permanente que sai junto olha para trás (motor/triggers.ts)',
    8: 'teste: morrendo junto com Drivnod, ainda dispara a mais',
    9: 'regra geral: CR 603.2 — cada Drivnod soma um disparo (motor/triggers.ts extraTriggers)',
  },
});
