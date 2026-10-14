// Gonti, Lord of Luxury
// Deathtouch
// When Gonti enters, look at the top four cards of target opponent's library, exile one of them face down, then put the
// rest on the bottom of that library in a random order. You may cast that card for as long as it remains exiled, and
// mana of any type can be spent to cast that spell.
import { allowPlay, chooseItems, defineCard, etb, keyword, moveObjects, nameOf, t, tgtPlayer } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import { ROUBO } from '../roubo.ts';

export default defineCard({
  name: 'Gonti, Lord of Luxury',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      etb(function* (c) {
        const s = c.g.state;
        const p = tgtPlayer(c);
        if (p === null) return;
        const topo = s.zones.library[p].slice(0, 4);
        if (!topo.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, `Gonti: escolha a carta de ${s.players[p].name} para exilar virada para baixo (as outras vão para o fundo do grimório em ordem aleatória)`,
          topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } })), 1, 1);
        const escolhida = Number(esc);
        // virada para baixo; só você pode olhá-la (CR 406.3)
        const [ex] = yield* moveObjects(c.g, [{ id: escolhida, to: 'exile', faceDown: true, visibleTo: [c.you] }], 'exile');
        const resto = shuffle(s.rng, topo.filter((id) => id !== escolhida && s.objects[id]?.zone === 'library'));
        s.zones.library[p] = [...s.zones.library[p].filter((id) => !resto.includes(id)), ...resto];
        c.g.bump();
        if (ex === null || ex === undefined || s.objects[ex]?.zone !== 'exile') return;
        // ruling 2: "conjurar" não deixa jogar terreno
        allowPlay(c.g, c.you, c.source, [ex], { kind: 'permanent' }, { anyType: true, spellsOnly: true });
      }, {
        targets: [t.opponent()],
        text: 'Quando Gonti entra, olhe as quatro cartas do topo do grimório do oponente alvo, exile uma delas virada para baixo e coloque o resto no fundo desse grimório em ordem aleatória. Você pode conjurar essa carta enquanto ela continuar exilada, e mana de qualquer tipo pode ser gasta para conjurá-la.',
      }),
    ],
  }],
  rulings: {
    1: ROUBO.qualquerTipo,
    2: 'teste: um terreno exilado assim não pode ser jogado',
    3: ROUBO.tempo,
    4: 'teste: você conjura a carta exilada com mana de qualquer tipo, mesmo depois de Gonti sair do campo',
    5: ROUBO.sai,
    6: ROUBO.saiuDaPartida,
    7: ROUBO.tempo,
  },
});
