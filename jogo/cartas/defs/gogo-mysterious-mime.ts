// Gogo, Mysterious Mime
// At the beginning of combat on your turn, you may have Gogo become a copy of another target creature you control until
// end of turn, except its name is Gogo, Mysterious Mime. If you do, Gogo and that creature each get +2/+0 and gain haste
// until end of turn and attack this turn if able.
import { and, copiableValues, defineCard, is, nameOf, on, t, tgt, triggered, untilEndOfTurn, yesNo } from '../../motor/api.ts';

const NOME = 'Gogo, Mysterious Mime';

export default defineCard({
  name: NOME,
  faces: [{
    abilities: [triggered(on.beginCombat('you'), function* (c) {
      const id = tgt(c);
      if (id === null || c.g.state.objects[c.source]?.zone !== 'battlefield') return;
      if (!(yield* yesNo(c.g, c.you, `Gogo: virar uma cópia de ${nameOf(c.g, id)} até o fim do turno?`))) return;
      // rulings 1-5: valores copiáveis (o que ela copiar), com o nome como exceção — a regra da lenda não pega
      const v = copiableValues(c.g, id);
      untilEndOfTurn(c, [c.source], [{ k: 'copy', of: { ...v, except: { ...(v.except ?? {}), name: NOME } } }]);
      untilEndOfTurn(c, [c.source, id], [{ k: 'pt', p: 2, t: 0 }, { k: 'addKeyword', kw: 'haste' }, { k: 'rule', id: 'rule:attacksIfAble' }]);
    }, {
      targets: [t.creature(and(is.yours, is.other), 'outra criatura alvo que você controla')],
      text: 'No início do combate no seu turno, você pode fazer Gogo virar uma cópia de outra criatura alvo que você controla até o fim do turno, exceto que o nome é Gogo, Mysterious Mime. Se fizer isso, Gogo e essa criatura recebem +2/+0, ganham ímpeto até o fim do turno e atacam neste turno se puderem.',
    })],
  }],
  rulings: {
    1: 'teste: copiando uma lendária, a regra da lenda não pega (nomes diferentes)',
    2: 'regra geral: CR 707.3 — copia o que a criatura estiver copiando',
    3: 'regra geral: CR 707.2 — ficha copia os valores originais da ficha',
    4: 'regra geral: CR 707.9 — X vale 0',
    5: 'regra geral: CR 707.2 — sem marcadores nem efeitos',
  },
});
