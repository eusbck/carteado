// Queen's Diamond
// {T}: Choose a color. Add one mana of that color for each charge counter on Queen's Diamond. Spend this mana only to
// cast your commander.
// Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. Station only as
// a sorcery. It's an artifact creature at 8+.)
// 8+ | Flying, vigilance, haste
// 5/5
import { defineCard, defineFn, mana, station, stationLevel, type G } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';
import { ehComandanteDe } from '../wakanda.ts';

// "gaste esta mana só para conjurar o seu comandante": a mágica tem de ser um comandante de quem gasta a mana
const RESTRICAO = "Queen's Diamond:comandante";
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) => {
  if (purpose.kind !== 'spell' || purpose.obj === undefined) return false;
  const o = g.state.objects[purpose.obj];
  return !!o && ehComandanteDe(g, purpose.obj, o.stack?.controller ?? o.controller);
});

export default defineCard({
  name: "Queen's Diamond",
  faces: [{
    abilities: [
      mana((c) => {
        const n = c.g.state.objects[c.source]?.counters.charge ?? 0;
        return n > 0 ? (['W', 'U', 'B', 'R', 'G'] as ManaType[]).map((cor) => Array<ManaType>(n).fill(cor)) : [];
      }, { restriction: RESTRICAO, text: "{T}: Escolha uma cor. Adicione uma mana dessa cor para cada marcador de carga em Queen's Diamond. Gaste esta mana só para conjurar o seu comandante." }),
      station(),
      // CR 721.2b: com 8 ou mais marcadores de carga é uma criatura 5/5 com voar, vigilância e ímpeto
      ...stationLevel(8, { creature: true, keywords: ['flying', 'vigilance', 'haste'], text: 'Voar, vigilância, ímpeto. 5/5' }),
    ],
  }],
  rulings: {},
});
