// Marionette Apprentice
// Fabricate 1 (When this creature enters, put a +1/+1 counter on it or create a 1/1 colorless Servo artifact creature
// token.)
// Whenever another creature or artifact you control is put into a graveyard from the battlefield, each opponent loses 1
// life.
import { defineCard, loseLife, on, triggered } from '../../motor/api.ts';
import { fabricar } from '../forragear.ts';

export default defineCard({
  name: 'Marionette Apprentice',
  faces: [{
    abilities: [
      fabricar(1),
      // CR 603.10a: olha para trás (última informação conhecida); "outra": não a própria Marionette
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard' || e.old === c.source) return false;
        const l = c.g.state.lki[e.old];
        return !!l && l.chars.controller === c.you && (l.chars.types.includes('Creature') || l.chars.types.includes('Artifact'));
      }), function* (c) {
        for (const p of c.g.apnap().filter((x) => c.g.isOpponent(c.you, x))) loseLife(c.g, p, 1, c.source);
      }, { text: 'Sempre que outra criatura ou outro artefato que você controla é colocado num cemitério vindo do campo, cada oponente perde 1 ponto de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2 — a escolha do fabricar é feita na resolução, sem ninguém agir no meio (cartas/forragear.ts fabricar)',
    2: 'teste: CR 702.123a: entra 1/2 e o fabricar vai para a pilha; escolhendo o marcador, fica 2/3',
    3: 'teste: se a Marionette saiu do campo antes do fabricar resolver, cria o Servo',
  },
});
