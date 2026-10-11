// Hammer of Nazahn
// Whenever Hammer of Nazahn or another Equipment you control enters, you may attach that Equipment to target creature
// you control.
// Equipped creature gets +2/+0 and has indestructible.
// Equip {4}
import { and, attach, attachedGets, controllerOf, defineCard, equip, is, nameOf, on, t, tgt, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Hammer of Nazahn',
  faces: [{
    abilities: [
      // ruling 1: um gatilho por Equipamento que entra (o próprio Hammer é um Equipamento); CR 603.2c
      triggered(on.enters(and(is.subtype('Equipment'), is.yours)), function* (c) {
        const equipamento = c.event.obj as ObjId;
        const criatura = tgt(c);
        const o = c.g.state.objects[equipamento];
        if (criatura === null || !o || o.zone !== 'battlefield' || controllerOf(c.g, equipamento) !== c.you) return;
        if (!(yield* yesNo(c.g, c.you, `Hammer of Nazahn: anexar ${nameOf(c.g, equipamento)} a ${nameOf(c.g, criatura)}?`))) return;
        // CR 301.5b: outros efeitos também podem anexar um Equipamento; 301.5c: não anexa se não puder equipar
        attach(c.g, equipamento, criatura);
      }, {
        targets: [t.creature(is.yours, 'criatura alvo que você controla')],
        text: 'Sempre que Hammer of Nazahn ou outro Equipamento que você controla entra, você pode anexar aquele Equipamento à criatura alvo que você controla.',
      }),
      attachedGets(() => [{ k: 'pt', p: 2, t: 0 }, { k: 'addKeyword', kw: 'indestructible' }], 'A criatura equipada recebe +2/+0 e tem indestrutível.'),
      equip('{4}'),
    ],
  }],
  rulings: {
    1: 'teste: entrando junto com outro Equipamento, dispara para cada um',
    2: 'teste: CR 702.12b: o dano marcado fica; ao mover o martelo, a criatura antes indestrutível morre',
  },
});
