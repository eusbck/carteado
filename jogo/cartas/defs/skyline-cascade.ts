// Skyline Cascade
// This land enters tapped.
// When this land enters, target creature an opponent controls doesn't untap during its controller's next untap step.
// {T}: Add {U}.
import { defineCard, etb, is, land, mana, nameOf, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Skyline Cascade',
  faces: [{
    abilities: [
      land.tapped(),
      etb(function* (c) {
        const id = tgt(c);
        const o = id !== null ? c.g.state.objects[id] : null;
        if (!o) return;
        // rulings 1-2: não vira a criatura; a marca fica na criatura (vale na próxima etapa de desvirar de quem a controlar)
        o.data.skipNextUntap = true;
        c.g.bump();
        c.g.log(`${nameOf(c.g, o.id)} não desvira na próxima etapa de desvirar do controlador.`);
      }, { targets: [t.creature(is.opponents, 'criatura alvo que um oponente controla')], text: 'Quando este terreno entra, a criatura alvo que um oponente controla não desvira durante a próxima etapa de desvirar do controlador dela.' }),
      mana('U'),
    ],
  }],
  rulings: {
    1: 'teste: a criatura virada do oponente não desvira na etapa de desvirar seguinte dele, mas desvira na outra',
    2: 'regra geral: a marca fica na criatura, não no jogador (motor/turn.ts skipNextUntap)',
  },
});
