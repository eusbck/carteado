// Command Beacon
// {T}: Add {C}.
// {T}, Sacrifice this land: Put your commander into your hand from the command zone.
import { activated, chooseItems, defineCard, mana, moveObjects, nameOf } from '../../motor/api.ts';

export default defineCard({
  name: 'Command Beacon',
  faces: [{
    abilities: [
      mana('C'),
      activated('{T}, Sacrifice this land', function* (c) {
        const s = c.g.state;
        // seus comandantes que estão na zona de comando agora (rulings 2 e 6: senão, nada acontece)
        const meus = s.zones.command.filter((id) => {
          const o = s.objects[id];
          return o.owner === c.you && o.card !== null && !!s.cards[o.card]?.isCommander;
        });
        if (meus.length === 0) return;
        // rulings 3 e 4: com dois comandantes (parceiros), só um vai para a mão, à sua escolha
        const [esc] = meus.length === 1 ? [String(meus[0])] : yield* chooseItems(c.g, c.you, 'Command Beacon: escolha o comandante que vai para a sua mão',
          meus.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } })), 1, 1);
        // CR 903.9b: o dono ainda pode deixá-lo na zona de comando (o motor pergunta)
        yield* moveObjects(c.g, [{ id: Number(esc), to: 'hand' }], 'effect');
      }, { text: '{T}, Sacrifique este terreno: Coloque seu comandante da zona de comando na sua mão.' }),
    ],
  }],
  rulings: {
    1: 'teste: CR 903.8: conjurado da mão, não paga o imposto de comandante nem aumenta o imposto',
    2: 'teste: com o comandante fora da zona de comando, nada acontece',
    3: 'teste: com dois comandantes na zona de comando, só um vai para a mão',
    4: 'teste: com dois comandantes na zona de comando, só um vai para a mão',
    5: 'teste: CR 903.8: conjurado da mão, não paga o imposto de comandante nem aumenta o imposto',
    6: 'teste: com o comandante fora da zona de comando, nada acontece',
  },
});
