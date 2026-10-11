// Notas de rulings que se repetem nas cartas de reunir Orcs e do Anel (deck The Hosts of Mordor).
export const REUNIR = {
  escrita: 'regra geral: CR 701.47a — "reunir [subtipo] N"; o motor recebe o subtipo (motor/criaturas.ts amass)',
  como: 'regra geral: CR 701.47a — sem Army, cria um Orc Army 0/0 preto; depois põe N marcadores +1/+1 num Army seu, que vira Orc também (motor/criaturas.ts amass)',
  zumbis: 'regra geral: CR 701.47a — reunir Zombies funciona igual, com o outro subtipo (motor/criaturas.ts amass)',
  varios: 'regra geral: CR 701.47a — com vários Armies, você escolhe qual recebe os marcadores (motor/criaturas.ts amass)',
  entra00: 'regra geral: CR 701.47a — a ficha entra 0/0 e só depois recebe os marcadores (motor/criaturas.ts amass)',
  alvos: 'regra geral: CR 608.2b — com todos os alvos ilegais a mágica ou habilidade não resolve e nada é reunido',
  reunido: 'regra geral: CR 701.47a — o "Army reunido" é o Army escolhido, mesmo sem marcador posto (motor/criaturas.ts amass devolve o Army)',
};
export const ANEL = {
  emblema: 'regra geral: CR 701.54c — você recebe o emblema do Anel se ainda não tem, e ele ganha a próxima habilidade (motor/criaturas.ts ringTempts)',
  semCriatura: 'regra geral: CR 701.54a — o Anel tenta você mesmo sem criatura (motor/criaturas.ts ringTempts)',
  mesmo: 'regra geral: CR 701.54a — escolher de novo o mesmo Portador do Anel conta como escolher (motor/criaturas.ts ringTempts)',
  ordem: 'regra geral: CR 701.54c — o Anel ganha as habilidades em ordem e as mantém (motor/criaturas.ts ringTempts)',
  obrigatorio: 'regra geral: CR 701.54a — com criatura no campo, escolher é obrigatório (motor/criaturas.ts ringTempts)',
  um: 'regra geral: CR 701.54a — um emblema e um Portador do Anel por jogador (motor/criaturas.ts ringTempts)',
  alvos: 'regra geral: CR 608.2b — com todos os alvos ilegais a mágica ou habilidade não resolve e o Anel não tenta você',
};
