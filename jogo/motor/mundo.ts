// lote4-e: regra do mundo (CR 704.5k), ação baseada em estado. "Se dois ou mais permanentes têm o supertipo mundo,
// todos menos o que tem o supertipo há menos tempo vão para o cemitério dos donos. Empatados no menor tempo, vão
// todos." O tempo é o carimbo de tempo do permanente (CR 613.7d: um permanente ganha carimbo ao entrar); um que ganhou
// o supertipo depois de entrar não é distinguido (nenhuma carta dos decks dá o supertipo mundo).
import { moveObjects } from './actions.ts';
import { chars } from './chars.ts';
import type { Gen } from './defs.ts';
import type { G } from './game-context.ts';
import type { ZoneName } from './types.ts';
import { obj, reg } from './registro.ts';

export function* regraDoMundo(g: G): Gen<boolean> {
  const s = g.state;
  const mundos = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && chars(g, id).supertypes.includes('World'));
  if (mundos.length < 2) return false;
  const maisNovo = Math.max(...mundos.map((id) => s.objects[id].timestamp));
  const novos = mundos.filter((id) => s.objects[id].timestamp === maisNovo);
  const saem = novos.length > 1 ? mundos : mundos.filter((id) => !novos.includes(id));
  for (const id of saem) reg(g, 'zona', { rule: '704.5k' })`Regra do mundo: ${obj(id)} vai para o cemitério.`;
  yield* moveObjects(g, saem.map((id) => ({ id, to: 'graveyard' as ZoneName })), 'sba');
  return true;
}
