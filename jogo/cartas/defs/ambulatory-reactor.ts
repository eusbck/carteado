// Ambulatory Reactor
// Artifact creatures you control have "{T}: Add {C}. Spend this mana only to cast an artifact spell or activate an
// ability of an artifact source."
import { chars, defineAbility, defineCard, defineFn, mana, type G } from '../../motor/api.ts';
import { artefatosTem } from '../borg.ts';

const RESTRICAO = 'Ambulatory Reactor:artefatos';
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) => {
  if (purpose.obj === undefined) return false;
  const o = g.state.objects[purpose.obj] ?? g.state.lki[purpose.obj]?.obj;
  if (!o) return false;
  if (purpose.kind === 'spell') return chars(g, purpose.obj).types.includes('Artifact');
  if (purpose.kind !== 'ability') return false;
  // a habilidade na pilha aponta a fonte; antes de ir para a pilha, o propósito é a própria fonte
  const fonte = o.stack?.source ?? purpose.obj;
  const ch = g.state.objects[fonte] ? chars(g, fonte) : g.state.lki[fonte]?.chars;
  return !!ch?.types.includes('Artifact');
});

const HAB = 'Ambulatory Reactor:mana';
defineAbility(HAB, mana('C', { restriction: RESTRICAO, text: '{T}: Adicione {C}. Gaste esta mana só para conjurar uma mágica de artefato ou ativar uma habilidade de uma fonte artefato.' }));

export default defineCard({
  name: 'Ambulatory Reactor',
  faces: [{ abilities: [artefatosTem(HAB, 'As criaturas artefato que você controla têm "{T}: Adicione {C}. Gaste esta mana só para conjurar uma mágica de artefato ou ativar uma habilidade de uma fonte artefato."')] }],
  rulings: {},
});
