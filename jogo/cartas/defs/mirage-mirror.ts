// Mirage Mirror
// {2}: This artifact becomes a copy of target artifact, creature, enchantment, or land until end of turn.
import { activated, becomeCopy, defineCard, is, or, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Mirage Mirror',
  faces: [{
    abilities: [
      activated('{2}', function* (c) {
        const id = tgt(c);
        // rulings 2-3: valores copiáveis do alvo (CR 707.2), inclusive o que ele estiver copiando; até o fim do turno
        if (id !== null) becomeCopy(c, c.source, id, { duration: { kind: 'endOfTurn' } });
      }, {
        targets: [t.permanent(or(is.artifact, is.creature, is.enchantment, is.land), 'artefato, criatura, encantamento ou terreno alvo')],
        text: '{2}: Este artefato vira uma cópia do artefato, criatura, encantamento ou terreno alvo até o fim do turno.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: vira uma cópia do alvo até o fim do turno e, enquanto isso, não tem a própria habilidade',
    2: 'regra geral: CR 707.2 — copia os valores copiáveis, sem marcadores nem efeitos que mudaram o alvo (motor/mecanicas.ts copiableValues)',
    3: 'regra geral: CR 707.3 — copia o que o alvo estiver copiando (motor/mecanicas.ts copiableValues)',
    4: 'regra geral: CR 613.7 — entre vários efeitos de cópia, vale o de marca de tempo mais recente; todos acabam no fim do turno',
    5: 'regra geral: CR 707.2 — virar cópia não desfaz os efeitos que já se aplicavam ao permanente (motor/criaturas.ts becomeCopy)',
    6: 'regra geral: CR 302.6 — virando criatura no turno em que entrou, não ataca nem usa {T} sem ímpeto (motor/combat.ts, motor/costs.ts)',
    7: 'teste: copiando uma permanente lendária sua, a regra das lendas se aplica',
    8: 'regra geral: CR 704.5m — copiando uma Aura sem estar anexado, vai para o cemitério (motor/sba.ts)',
  },
});
