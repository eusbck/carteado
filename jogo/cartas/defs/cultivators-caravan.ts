// Cultivator's Caravan
// {T}: Add one mana of any color.
// Crew 3 (Tap any number of creatures you control with total power 3 or more: This Vehicle becomes an artifact creature until end of turn.)
import { crew, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Cultivator's Caravan",
  faces: [{ abilities: [mana('any'), crew(3)] }],
  rulings: {
    "1": "CR 707.2: copiar veículo não copia a animação da tripulação; a cópia tem os valores copiáveis impressos.",
    "2": "CR 301.7, 613.1: teste: força e resistência impressas passam a valer quando tripular transforma o veículo em criatura.",
    "3": "CR 613.4b: setPT de outros efeitos sobrepõe os valores impressos; tripular não redefine força e resistência.",
    "4": "CR 205.3g, 301.7: Vehicle é subtipo de artefato; tripular acrescenta Creature sem acrescentar tipo de criatura.",
    "5": "CR 602.2: não há prioridade durante escolhas e pagamento da tripulação; custo concluído antes de pôr a habilidade disponível para respostas.",
    "6": "CR 302.6: teste: criaturas recém-controladas podem tripular; custo não contém símbolo {T}.",
    "7": "CR 702.122a: teste: pode escolher mais criaturas que o mínimo; a soma das forças precisa atingir N.",
    "8": "CR 702.122b-c: tripulantes não são anexados; destruir o veículo não destrói quem tripulou.",
    "9": "CR 302.6, 301.7: veículo tripulado obedece enjoo, ataque e bloqueio; pode tripular outro veículo, não a si mesmo.",
    "10": "CR 702.122a: pode tripular novamente; isso não redefine F/R nem remove efeitos anteriores.",
    "11": "CR 508.1a, 509.1a: precisa ser criatura antes da declaração; habilidade usa a pilha e permite respostas depois de resolver.",
    "12": "CR 301.7: tornar-se criatura muda características; não gera evento de entrada.",
    "13": "CR 302.6: teste: antes de virar criatura, pode ativar {T} mesmo tendo entrado neste turno."
  },
});
