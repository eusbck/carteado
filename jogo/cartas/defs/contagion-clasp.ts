// Contagion Clasp
// When this artifact enters, put a -1/-1 counter on target creature.
// {4}, {T}: Proliferate.
import { activated, addCounters, defineCard, etb, proliferate, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Contagion Clasp',
  faces: [{
    abilities: [
      etb(function* (c) { const id = tgt(c); if (id !== null) addCounters(c.g, { kind: 'obj', id }, '-1/-1', 1, c.you); },
        { targets: [t.creature()], text: 'Quando este artefato entra, coloque um marcador -1/-1 na criatura alvo.' }),
      activated('{4}, {T}', function* (c) { yield* proliferate(c.g, c.you); }, { text: '{4}, {T}: Prolifere.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.3d — gatilho com alvo obrigatório mira o que houver',
    2: 'regra geral: prolifera mesmo sem escolher nada',
    3: 'teste: escolhe permanentes e jogadores de qualquer um, só no campo',
    4: 'teste: pode não escolher todos',
    5: 'teste: cada escolhido ganha um de cada tipo que já tem',
    6: 'regra geral: CR 608.2 — escolhas na resolução',
    7: 'regra geral: CR 704.5q — marcadores +1/+1 e -1/-1 se anulam',
  },
});
