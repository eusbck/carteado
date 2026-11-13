// lote3-a: Histórico (Storied, CR 702.195). "Sempre que você controlar três ou mais permanentes que sejam artefatos, Sagas
// e/ou lendárias e não tiver uma história duradoura, você tem uma história duradoura pelo resto da partida." Não usa a
// pilha (702.195a, ruling 2 de Kíli): o motor confere como as ações baseadas em estado, pelo gancho stateAction. A
// designação fica no jogador (players[p].enduringStory) e não sai mais (702.195b), mesmo sem a permanente com
// histórico.
import { chars, controllerOf } from './chars.ts';
import type { AbilityDef, Gen, SCtx } from './defs.ts';
import { keyword } from './dsl.ts';
import type { G } from './game-context.ts';
import type { PlayerId } from './types.ts';

/** quantas permanentes do jogador são artefato, Saga ou lendária (cada uma conta uma vez, ruling 3) */
export function permanentesDeHistoria(g: G, p: PlayerId): number {
  return g.state.zones.battlefield.filter((id) => {
    const o = g.state.objects[id];
    if (o.phasedOut || controllerOf(g, id) !== p) return false;
    const ch = chars(g, id);
    return ch.types.includes('Artifact') || ch.subtypes.includes('Saga') || ch.supertypes.includes('Legendary');
  }).length;
}

/** o jogador tem uma história duradoura? (CR 702.195b) */
export function temHistoriaDuradoura(g: G, p: PlayerId): boolean {
  return !!g.state.players[p]?.enduringStory;
}

/** a palavra-chave histórico (CR 702.195a), para pôr em `abilities` */
export function storied(): AbilityDef[] {
  return [
    keyword('storied'),
    {
      kind: 'static',
      text: 'Histórico (Se você controlar três ou mais artefatos, lendárias e/ou Sagas, você tem uma história duradoura pelo resto da partida.)',
      rules: {
        *stateAction(c: SCtx): Gen<boolean> {
          const pl = c.g.state.players[c.you];
          if (!pl || pl.enduringStory || permanentesDeHistoria(c.g, c.you) < 3) return false;
          pl.enduringStory = true;
          c.g.bump();
          c.g.log(`${pl.name} tem uma história duradoura.`, { rule: '702.195a' });
          return true;
        },
      },
    },
  ];
}
