// Necron Overlord
// Relentless March — {X}, {T}, Tap X untapped artifacts you control: Target opponent loses X life.
import { activated, controllerOf, defineCard, isType, loseLife, t, tgtPlayer } from '../../motor/api.ts';

const MARCHA = activated('{X}, {T}', function* (c) {
  const p = tgtPlayer(c);
  if (p !== null && c.x > 0) loseLife(c.g, p, c.x, c.source);
}, {
  targets: [t.opponent()],
  // X não passa do número de artefatos desvirados que você controla, fora ele mesmo (que paga o {T})
  xMax: (c) => c.g.state.zones.battlefield.filter((id) => id !== c.source && controllerOf(c.g, id) === c.you && isType(c.g, id, 'Artifact') && !c.g.state.objects[id].tapped).length,
  text: 'Relentless March — {X}, {T}, Vire X artefatos desvirados que você controla: O oponente alvo perde X pontos de vida.',
});
// o custo "vire X artefatos" não tem texto que o analisador de custos entenda
MARCHA.cost.push({ k: 'tapPermanents', n: 'X', label: 'artefatos desvirados', filter: (c, id) => isType(c.g, id, 'Artifact') });

export default defineCard({
  name: 'Necron Overlord',
  faces: [{ abilities: [MARCHA] }],
  rulings: {},
});