// Psychomancer
// Flying
// Harbinger of Despair — Whenever this creature or another nontoken artifact you control is put into a graveyard from the
// battlefield or is put into exile from the battlefield, target opponent loses 1 life and you gain 1 life.
import { defineCard, gainLife, keyword, lkiChars, loseLife, on, t, tgtPlayer, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Psychomancer',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.from !== 'battlefield' || (e.to !== 'graveyard' && e.to !== 'exile')) return false;
        if (e.old === c.source) return true;
        const ch = lkiChars(c.g, e.old);
        return !e.token && !!ch && ch.types.includes('Artifact') && ch.controller === c.you;
      }), function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) loseLife(c.g, p, 1, c.source);
        gainLife(c.g, c.you, 1, c.source);
      }, { targets: [t.opponent()], text: 'Harbinger of Despair — Sempre que esta criatura ou outro artefato que não é ficha que você controla é colocado num cemitério vindo do campo ou é exilado do campo, o oponente alvo perde 1 ponto de vida e você ganha 1 ponto de vida.' }),
    ],
  }],
  rulings: {},
});