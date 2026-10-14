// Giada, Font of Hope
// Flying, vigilance
// Each other Angel you control enters with an additional +1/+1 counter on it for each Angel you already control.
// {T}: Add {W}. Spend this mana only to cast an Angel spell.
import { chars, controllerOf, defineCard, defineFn, keywords, mana, staticAbility, type G } from '../../motor/api.ts';

// "Gaste essa mana somente para conjurar uma mágica de Angel" (CR 106.6)
const RESTRICAO = 'Giada, Font of Hope:magicaDeAngel';
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) => {
  if (purpose.kind !== 'spell' || purpose.obj === undefined || !g.state.objects[purpose.obj]) return false;
  const c = chars(g, purpose.obj);
  return c.types.includes('Creature') && c.subtypes.includes('Angel');
});

export default defineCard({
  name: 'Giada, Font of Hope',
  faces: [{
    abilities: [
      ...keywords('flying', 'vigilance'),
      // CR 614.1c: substituição "entra com"; ruling 1: conta os Angels que você já controla, inclusive Giada, e não o que entra
      staticAbility({
        rules: {
          enterModifier: (c, ev, vaiSer) => {
            if (ev.obj === c.source || ev.controller !== c.you || !vaiSer.types.includes('Creature') || !vaiSer.subtypes.includes('Angel')) return;
            const s = c.g.state;
            const n = s.zones.battlefield.filter((id) => id !== ev.obj && !s.objects[id].phasedOut && controllerOf(c.g, id) === c.you && chars(c.g, id).types.includes('Creature') && chars(c.g, id).subtypes.includes('Angel')).length;
            if (n > 0) ev.counters['+1/+1'] = (ev.counters['+1/+1'] ?? 0) + n;
          },
        },
        text: 'Cada outro Angel que você controla entra com um marcador +1/+1 a mais para cada Angel que você já controla.',
      }),
      mana('W', { restriction: RESTRICAO, text: '{T}: Adicione {W}. Gaste essa mana somente para conjurar uma mágica de Angel.' }),
    ],
  }],
  rulings: { 1: 'teste: conta os Angels que você já controla, inclusive Giada, e não o que está entrando' },
});
