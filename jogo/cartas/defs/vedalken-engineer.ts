// Vedalken Engineer
// {T}: Add two mana of any one color. Spend this mana only to cast artifact spells or activate abilities of artifacts.
import { defineCard, defineFn, isType, lkiChars, mana, type G, type ManaType } from '../../motor/api.ts';

// CR 106.6: mana com restrição — mágica de artefato ou habilidade de um artefato (a fonte da habilidade na pilha)
const RESTRICAO = 'Vedalken Engineer:artefatos';
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) => {
  if (purpose.obj === undefined) return false;
  if (purpose.kind === 'spell') return isType(g, purpose.obj, 'Artifact');
  if (purpose.kind !== 'ability') return false;
  const o = g.state.objects[purpose.obj];
  const fonte = o?.zone === 'stack' && o.stack?.source !== undefined ? o.stack.source : purpose.obj;
  return !!lkiChars(g, fonte)?.types.includes('Artifact');
});

const CORES: ManaType[] = ['W', 'U', 'B', 'R', 'G'];

export default defineCard({
  name: 'Vedalken Engineer',
  faces: [{
    abilities: [
      mana(() => CORES.map((x) => [x, x]), { restriction: RESTRICAO, text: '{T}: Adicione duas manas de qualquer uma cor. Gaste essa mana somente para conjurar mágicas de artefato ou ativar habilidades de artefatos.' }),
    ],
  }],
  rulings: {},
});
