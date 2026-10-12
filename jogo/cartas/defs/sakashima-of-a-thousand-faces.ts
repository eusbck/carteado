// Sakashima of a Thousand Faces
// You may have Sakashima enter as a copy of another creature you control, except it has Sakashima's other abilities.
// The "legend rule" doesn't apply to permanents you control.
// Partner (You can have two commanders if both have partner.)
import { creaturesOf, defineAbility, defineCard, entersAsCopy, staticAbility } from '../../motor/api.ts';
import { SELECAO } from '../tartarugas.ts';

// "as outras habilidades de Sakashima": a regra da lenda (parceiro é da montagem do deck)
const SEM_REGRA_DA_LENDA = defineAbility('Sakashima of a Thousand Faces:lenda', staticAbility({
  rules: { legendRuleExempt: (c, jogador) => jogador === c.you },
  text: 'A "regra da lenda" não se aplica às permanentes que você controla.',
}));

const COPIA = 'regra geral: CR 707.2 — copia só os valores copiáveis da criatura, com a exceção das outras habilidades de Sakashima (motor/criaturas.ts entersAsCopy)';

export default defineCard({
  name: 'Sakashima of a Thousand Faces',
  faces: [{
    abilities: [
      // CR 707.9a: a exceção faz parte dos valores copiáveis (ruling 10: quem copiar Sakashima também as tem)
      entersAsCopy({
        label: 'Sakashima of a Thousand Faces', what: 'outra criatura que você controla',
        text: 'Você pode fazer Sakashima entrar como uma cópia de outra criatura que você controla, exceto que ele tem as outras habilidades de Sakashima.',
        candidates: (c, ev) => creaturesOf(c.g, ev.controller),
        except: () => ({ addAbilities: [SEM_REGRA_DA_LENDA.id!] }),
      }),
      SEM_REGRA_DA_LENDA,
    ],
  }],
  rulings: {
    1: SELECAO.perder,
    2: SELECAO.separados,
    3: SELECAO.refere,
    4: SELECAO.comecam,
    5: SELECAO.identidade,
    6: SELECAO.controla,
    7: 'não se aplica: é da montagem do deck, e dois comandantes ainda não existem neste jogo (o importador recusa; ver PROGRESSO, "dois comandantes")',
    8: 'regra geral: CR 903.3 — ser comandante é da carta, não do que ela copia: copiando outra criatura, continua (ou continua não) sendo comandante (motor/state.ts)',
    9: 'regra geral: CR 707.2 — o X do custo de mana copiado vale 0 (motor/chars.ts)',
    10: 'regra geral: CR 707.9a — a exceção entra nos valores copiáveis: quem copiar Sakashima também tem as outras habilidades dele (motor/criaturas.ts entersAsCopy)',
    11: 'regra geral: CR 707.2 — copiando uma ficha, valem as características originais dela (motor/criaturas.ts entersAsCopy)',
    12: 'regra geral: CR 707.5 — só dá para copiar uma criatura que já esteja no campo; a que entra junto não serve (motor/criaturas.ts entersAsCopy)',
    13: 'regra geral: CR 707.3 — se a criatura escolhida é cópia de outra coisa, Sakashima entra como o que ela copiou (motor/criaturas.ts entersAsCopy)',
    14: 'teste: entra como cópia de outra criatura sua, com a regra da lenda suspensa: as duas lendárias de mesmo nome ficam no campo',
    15: 'regra geral: CR 707.5 — as habilidades de entrar da criatura copiada valem para Sakashima (motor/actions.ts putOntoBattlefield)',
    16: COPIA,
    17: 'regra geral: CR 704.5j — se a regra da lenda voltar a valer, você escolhe uma de cada nome e as outras vão para o cemitério (motor/sba.ts)',
    18: 'regra geral: CR 704.5j — a regra da lenda: duas ou mais permanentes lendárias de mesmo nome sob o mesmo controle (motor/sba.ts)',
  },
});