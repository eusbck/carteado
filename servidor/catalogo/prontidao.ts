// Uma carta está pronta para jogar quando tem dados Oracle e uma definição de verdade em cartas/defs (as que não
// têm ficam registradas como pendentes por cartas/pendentes.ts). Quem importa este arquivo precisa ter carregado
// cartas/index.ts antes.

import { cardDef } from '../../motor/defs.ts';
import { hasOracle } from '../../motor/oracle.ts';

export function cartaPronta(nome: string): boolean {
  const d = cardDef(nome);
  return hasOracle(nome) && !!d && !d.pending;
}
