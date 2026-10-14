// Selfless Squire
// Flash
// When this creature enters, prevent all damage that would be dealt to you this turn.
// Whenever damage that would be dealt to you is prevented, put that many +1/+1 counters on this creature.
import { addCounters, defineAbility, defineCard, etb, keywords, on, ruleEffect, triggered } from '../../motor/api.ts';
import type { StaticDef } from '../../motor/defs.ts';

// CR 615.1a: "previna todo o dano que seria causado a você neste turno" (c.you = quem controlava o Squire)
const PREVINE = defineAbility<StaticDef>('Selfless Squire:previne', {
  kind: 'static',
  rules: { preventsDamage: (c, alvo) => alvo.kind === 'player' && alvo.id === c.you },
});

export default defineCard({
  name: 'Selfless Squire',
  faces: [{
    abilities: [
      ...keywords('flash'),
      // ruling 1: o efeito vale até o fim do turno, mesmo que o Squire saia do campo
      etb(function* (c) { ruleEffect(c, PREVINE.id!, { kind: 'endOfTurn' }); }, { text: 'Quando esta criatura entra, previna todo o dano que seria causado a você neste turno.' }),
      // ruling 2: qualquer prevenção do dano a você dispara (motor/actions.ts emite 'damagePrevented')
      triggered(on.custom((e, c) => (e.type === 'damagePrevented' && e.target.kind === 'player' && e.target.id === c.you ? { n: e.amount } : false)), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', c.event.n as number, c.you);
      }, { text: 'Sempre que o dano que seria causado a você é prevenido, coloque essa quantidade de marcadores +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: com lampejo no combate do oponente: previne o dano a você e recebe um marcador por ponto de dano prevenido',
    2: 'teste: dano prevenido por outro efeito também conta',
  },
});
