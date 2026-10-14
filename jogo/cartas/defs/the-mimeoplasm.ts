// The Mimeoplasm
// As The Mimeoplasm enters, you may exile two creature cards from graveyards. If you do, it enters as a copy of one of
// those cards with a number of additional +1/+1 counters on it equal to the power of the other card.
import { asEnters, chars, chooseItems, defineCard, isCreature, moveObjects, nameOf, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'The Mimeoplasm',
  faces: [{
    abilities: [
      // CR 614.1c, 707.5: substituição "ao entrar"; as substituições e os gatilhos de entrar do modelo valem (rulings 4-5)
      asEnters(function* (c, ev) {
        const g = c.g;
        const s = g.state;
        const cartas = s.zones.graveyard.flat().filter((id) => id !== ev.obj && isCreature(g, id));
        // ruling 1: são duas ou nenhuma
        if (cartas.length < 2) return;
        if (!(yield* yesNo(g, ev.controller, 'The Mimeoplasm: exilar duas cartas de criatura de cemitérios?'))) return;
        const item = (id: ObjId) => ({ id: String(id), label: `${nameOf(g, id)} (cemitério de ${s.players[s.objects[id].owner].name})`, obj: id, card: { def: s.objects[id].def } });
        const [m] = yield* chooseItems(g, ev.controller, 'The Mimeoplasm: escolha a carta que ela vai copiar', cartas.map(item), 1, 1);
        const modelo = Number(m);
        const [o] = yield* chooseItems(g, ev.controller, 'The Mimeoplasm: escolha a outra carta (a força dela vira marcadores +1/+1)', cartas.filter((id) => id !== modelo).map(item), 1, 1);
        const outra = Number(o);
        // os valores copiáveis de uma carta no cemitério são os impressos (CR 707.2); a força da outra, como está lá
        const copia = { def: s.objects[modelo].def, face: 0 };
        const forca = chars(g, outra).power ?? 0;
        const nomeModelo = nameOf(g, modelo);
        yield* moveObjects(g, [{ id: modelo, to: 'exile' }, { id: outra, to: 'exile' }], 'effect', ev.controller);
        ev.copyOf = copia;
        if (forca > 0) ev.counters['+1/+1'] = (ev.counters['+1/+1'] ?? 0) + forca;
        g.log(`The Mimeoplasm entra como cópia de ${nomeModelo} com ${Math.max(0, forca)} marcador(es) +1/+1 a mais.`, { rule: '707.5' });
      }, 'Ao entrar, você pode exilar duas cartas de criatura de cemitérios. Se fizer isso, ela entra como uma cópia de uma delas, com marcadores +1/+1 a mais iguais à força da outra.'),
    ],
  }],
  rulings: {
    1: 'teste: com só uma carta de criatura nos cemitérios, nada é exilado e ela morre como 0/0',
    2: 'teste: as duas cartas podem vir de cemitérios diferentes',
    3: 'teste: você escolhe qual copiar e qual dá os marcadores',
    4: 'teste: as habilidades de entrar do modelo funcionam',
    5: 'regra geral: CR 614.1c, 707.5 — os "entra com" do modelo também valem, somados aos marcadores (motor/actions.ts putOntoBattlefield)',
  },
});
