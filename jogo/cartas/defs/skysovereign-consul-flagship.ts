// Skysovereign, Consul Flagship
// Flying
// Whenever Skysovereign enters or attacks, it deals 3 damage to target creature or planeswalker an opponent controls.
// Crew 3 (Tap any number of creatures you control with total power 3 or more: This Vehicle becomes an artifact creature until end of turn.)
import { controllerOf, crew, dealDamage, defineCard, isCreature, isType, keyword, on, t, tgtRef, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Skysovereign, Consul Flagship",
  faces: [{
    abilities: [keyword('flying'),
    triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source))), function*(c) { const target = tgtRef(c); if (target) dealDamage(c.g, [{ source: c.source, target, amount: 3, combat: false }]); }, { targets: [t.creatureOrPlaneswalker('criatura ou planeswalker de oponente alvo')].map((sp) => ({ ...sp, filter: (c, target) => target.kind === 'obj' && c.g.isOpponent(c.you, controllerOf(c.g, target.id)) && (isCreature(c.g, target.id) || isType(c.g, target.id, 'Planeswalker')) })), text: 'Quando entra ou ataca, causa 3 de dano à criatura ou planeswalker alvo de um oponente.' }),
    crew(3),
    ]
  }],
  rulings: {
    "1": "CR 301.7, 613.1: teste: força e resistência impressas passam a valer quando tripular transforma o veículo em criatura.",
    "2": "CR 613.4b: setPT de outros efeitos sobrepõe os valores impressos; tripular não redefine força e resistência.",
    "3": "CR 205.3g, 301.7: Vehicle é subtipo de artefato; tripular acrescenta Creature sem acrescentar tipo de criatura.",
    "4": "CR 602.2: não há prioridade durante escolhas e pagamento da tripulação; custo concluído antes de pôr a habilidade disponível para respostas.",
    "5": "CR 302.6: teste: criaturas recém-controladas podem tripular; custo não contém símbolo {T}.",
    "6": "CR 702.122a: teste: pode escolher mais criaturas que o mínimo; a soma das forças precisa atingir N.",
    "7": "CR 702.122b-c: tripulantes não são anexados; destruir o veículo não destrói quem tripulou.",
    "8": "CR 302.6, 301.7: veículo tripulado obedece enjoo, ataque e bloqueio; pode tripular outro veículo, não a si mesmo.",
    "9": "CR 702.122a: pode tripular novamente; isso não redefine F/R nem remove efeitos anteriores.",
    "10": "CR 508.1a, 509.1a: precisa ser criatura antes da declaração; habilidade usa a pilha e permite respostas depois de resolver.",
    "11": "CR 301.7: tornar-se criatura muda características; não gera evento de entrada.",
    "12": "CR 707.2: copiar veículo não copia a animação da tripulação; a cópia tem os valores copiáveis impressos."
  },
});
