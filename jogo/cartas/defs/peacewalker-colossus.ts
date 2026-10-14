// Peacewalker Colossus
// {1}{W}: Another target Vehicle you control becomes an artifact creature until end of turn.
// Crew 4 (Tap any number of creatures you control with total power 4 or more: This Vehicle becomes an artifact creature
// until end of turn.)
import { activated, and, crew, defineCard, is, t, tgt } from '../../motor/api.ts';
import { ehVeiculo, viramCriaturasArtefato } from '../veiculos.ts';

export default defineCard({
  name: 'Peacewalker Colossus',
  faces: [{
    abilities: [
      // não é tripular: as habilidades de "fica tripulado" não disparam
      activated('{1}{W}', function* (c) {
        const id = tgt(c);
        if (id !== null) viramCriaturasArtefato(c, [id]);
      }, { targets: [t.permanent(and(is.yours, is.other, (c, id) => ehVeiculo(c.g, id)), 'outro Veículo alvo que você controla')], text: '{1}{W}: Outro Veículo alvo que você controla se torna uma criatura artefato até o fim do turno.' }),
      crew(4),
    ],
  }],
  rulings: {
    1: 'teste: {1}{W}: outro Veículo seu vira criatura artefato até o fim do turno, com a força e a resistência impressas',
    2: 'regra geral: CR 613.4b — um efeito que define a força e a resistência sobrepõe os valores impressos (motor/chars.ts)',
    3: 'regra geral: CR 205.3g, 301.7 — Vehicle é subtipo de artefato; virar criatura não dá tipo de criatura',
    4: 'regra geral: CR 602.2 — ninguém age durante a ativação e o pagamento da tripulação (motor/stack.ts)',
    5: 'regra geral: CR 302.6 — o custo de tripular não tem {T}: criatura com enjoo pode tripular (motor/costs.ts crewCandidates)',
    6: 'regra geral: CR 702.122a — pode virar mais criaturas que o necessário (motor/costs.ts)',
    7: 'regra geral: CR 702.122b-c — quem tripula não fica ligado ao Veículo (motor/mecanicas.ts crew)',
    8: 'regra geral: CR 302.6, 301.7 — tripulado, segue as regras de criatura: enjoo, ataque e bloqueio (motor/combat.ts)',
    9: 'regra geral: CR 702.122a — tripular de novo não muda nada (motor/mecanicas.ts crew)',
    10: 'regra geral: CR 508.1a, 509.1a — precisa ser criatura quando os atacantes ou bloqueadores são declarados (motor/combat.ts)',
    11: 'regra geral: CR 301.7 — virar criatura não é entrar no campo (motor/mecanicas.ts crew)',
    12: 'regra geral: CR 707.2 — a cópia de um Veículo não copia a animação da tripulação (motor/mecanicas.ts copiableValues)',
  },
});
