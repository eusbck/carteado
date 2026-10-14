// Emry, Lurker of the Loch
// Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)
// When Emry enters, mill four cards.
// {T}: Choose target artifact card in your graveyard. You may cast that card this turn. (You still pay its costs. Timing
// rules still apply.)
import { activated, allowPlay, defineCard, etb, is, mill, t, tgt } from '../../motor/api.ts';
import { affinity } from '../artefatos.ts';

export default defineCard({
  name: 'Emry, Lurker of the Loch',
  faces: [{
    // CR 702.41a: afinidade só reduz a mana genérica (rulings 2, 3, 6)
    selfCost: affinity,
    abilities: [
      etb(function* (c) { yield* mill(c.g, c.you, 4); }, { text: 'Quando Emry entra, muela quatro cartas.' }),
      // rulings 1, 7: paga os custos e segue o tempo normal; ruling 5: terreno artefato não se joga (spellsOnly);
      // ruling 4: a permissão é do objeto no cemitério, a carta que volta é outro objeto (CR 400.7)
      activated('{T}', function* (c) {
        const id = tgt(c);
        if (id !== null) allowPlay(c.g, c.you, c.source, [id], { kind: 'endOfTurn' }, { spellsOnly: true });
      }, { targets: [t.card('graveyard', is.artifact, 'carta de artefato alvo no seu cemitério')], text: '{T}: Escolha a carta de artefato alvo no seu cemitério. Você pode conjurá-la neste turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: depois de ativar, conjura o artefato do cemitério pagando o custo',
    2: 'teste: com três artefatos, custa só {U}',
    3: 'regra geral: CR 601.2f-h — o custo é travado antes do pagamento, sem respostas (motor/stack.ts)',
    4: 'regra geral: CR 400.7 — a carta que volta ao cemitério é outro objeto, sem a permissão (motor/priority.ts permissionsFor)',
    5: 'regra geral: CR 305.1 — a permissão é só de conjurar (spellsOnly): terreno não se joga',
    6: 'teste: com três artefatos, custa só {U}',
    7: 'teste: depois de ativar, conjura o artefato do cemitério pagando o custo',
  },
});
