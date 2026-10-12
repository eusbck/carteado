// Voracious Hydra
// Trample
// This creature enters with X +1/+1 counters on it.
// When this creature enters, choose one —
// • Double the number of +1/+1 counters on this creature.
// • This creature fights target creature you don't control.
import { defineCard, entersWithCounters, is, keyword, modal, not, on, t, tgt, triggered } from '../../motor/api.ts';
import { dobraMarcadores } from '../tartarugas.ts';
import { luta } from '../wakanda.ts';

export default defineCard({
  name: 'Voracious Hydra',
  faces: [{
    abilities: [
      keyword('trample'),
      entersWithCounters('+1/+1', (_c, ev) => Number(ev.spell?.x ?? 0)),
      triggered(on.selfEnters(), function* () { /* modos */ }, {
        modes: modal(1, 1, [
          { text: 'Dobre o número de marcadores +1/+1 nesta criatura', *effect(c) { if (c.g.state.objects[c.source]?.zone === 'battlefield') dobraMarcadores(c.g, c.source, '+1/+1', c.you); } },
          {
            text: 'Esta criatura luta com a criatura alvo que você não controla',
            targets: [t.creature(not(is.yours), 'criatura alvo que você não controla')],
            // ruling 2: sem o alvo ou sem a Hydra no campo, ninguém causa dano (cartas/wakanda.ts luta)
            *effect(c) { const id = tgt(c); if (id !== null) luta(c.g, c.source, id); },
          },
        ]),
        text: 'Quando esta criatura entra, escolha um — dobre o número de marcadores +1/+1 nesta criatura; ou esta criatura luta com a criatura alvo que você não controla.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.19 — atropelar só vale para dano de combate; a luta não é combate (motor/combat.ts)',
    2: 'teste: segundo modo: luta com a criatura alvo que você não controla',
  },
});