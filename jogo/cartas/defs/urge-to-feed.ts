// Urge to Feed
// Target creature gets -3/-3 until end of turn. You may tap any number of untapped Vampire creatures you control. If you
// do, put a +1/+1 counter on each of those Vampires.
import { addCounters, chooseItems, creaturesOf, defineCard, isSubtype, nameOf, objItem, t, tap, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Urge to Feed',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        // ruling 3: com o alvo ilegal a mágica não resolve e nenhum Vampire é virado
        const id = tgt(c);
        if (id === null) return;
        untilEndOfTurn(c, [id], [{ k: 'pt', p: -3, t: -3 }]);
        // ruling 1: os Vampires a virar são escolhidos na resolução; ruling 2: as ações de estado só vêm depois,
        // então o próprio alvo, se for um Vampire seu, pode ser virado e receber o marcador a tempo
        const desvirados = creaturesOf(c.g, c.you).filter((x) => isSubtype(c.g, x, 'Vampire') && !c.g.state.objects[x].tapped);
        if (!desvirados.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Urge to Feed: vire quantos Vampires desvirados quiser (cada um recebe um marcador +1/+1)', desvirados.map((x) => objItem(c.g, x, nameOf(c.g, x))), 0, desvirados.length);
        for (const x of esc.map(Number)) if (tap(c.g, x)) addCounters(c.g, { kind: 'obj', id: x }, '+1/+1', 1, c.you);
      },
    },
  }],
  rulings: {
    1: 'teste: a criatura alvo recebe -3/-3 e os Vampires que você virar na resolução ganham um marcador +1/+1',
    2: 'teste: o seu Vampire de resistência 3 que é o alvo sobrevive se for virado',
    3: 'regra geral: CR 608.2b — com o alvo ilegal a mágica não resolve e nenhum Vampire é virado',
  },
});
