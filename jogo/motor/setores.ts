// Setores do campo (Space Beleren, "space sculptor"). Enquanto houver uma permanente com escultor do espaço no campo,
// cada criatura fica num setor: alfa, beta ou gama. A carta faz a atribuição (uma ação baseada em estado, gancho
// stateAction); aqui fica o que o motor e a vista precisam para saber em que setor uma criatura está.
//
// As atribuições valem para uma "era": o tempo em que há pelo menos um escultor no campo. Quando o último sai, todas se
// perdem (ruling 5); um escultor que chega depois começa outra era, com atribuições novas. A era fica em
// data.eraDosSetores dos escultores, e a atribuição em data.setor e data.setorEra da criatura (o objeto é o mesmo
// quando muda de controlador, ruling 6, e é novo quando a carta sai e volta ao campo).

import { hasKw } from './chars.ts';
import type { G } from './game-context.ts';
import type { ObjId } from './types.ts';

export type Setor = 'alpha' | 'beta' | 'gamma';
export const SETORES: { id: Setor; label: string }[] = [{ id: 'alpha', label: 'Alfa' }, { id: 'beta', label: 'Beta' }, { id: 'gamma', label: 'Gama' }];
export const ESCULTOR = 'space sculptor';

/** permanentes com escultor do espaço no campo */
export function escultores(g: G): ObjId[] {
  const s = g.state;
  return s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && hasKw(g, id, ESCULTOR));
}

/** a era dos setores em vigor, ou null se não há escultor no campo (ou se a carta ainda não a abriu) */
export function eraDosSetores(g: G): number | null {
  for (const id of escultores(g)) {
    const era = g.state.objects[id].data.eraDosSetores;
    if (typeof era === 'number') return era;
  }
  return null;
}

/** o setor da criatura, ou null se ela não tem setor nesta era */
export function setorDe(g: G, id: ObjId): Setor | null {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield' || o.data.setor === undefined) return null;
  const era = eraDosSetores(g);
  return era !== null && o.data.setorEra === era ? (o.data.setor as Setor) : null;
}
