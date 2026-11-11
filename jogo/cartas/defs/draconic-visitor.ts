// Draconic Visitor
// Flying
// If one or more artifact tokens would be created under your control, that many 5/5 red Dragon creature tokens with
// flying are created instead.
import { copyValuesChars, defineCard, keyword, staticAbility } from '../../motor/api.ts';
import { registry } from '../../motor/defs.ts';
import type { TokenCreation } from '../../motor/defs.ts';

const DRAGAO = 'Dragon 5/5';

/** a ficha que seria criada é de artefato? (ruling 3: como ela seria criada, não o que viraria ao entrar) */
function ehArtefato(t: TokenCreation['tokens'][number], dono: number): boolean {
  if (t.copyOf) return copyValuesChars(t.copyOf, dono).types.includes('Artifact');
  return !!t.def && !!registry.tokens.get(t.def)?.types.includes('Artifact');
}

export default defineCard({
  name: 'Draconic Visitor',
  faces: [{
    abilities: [
      keyword('flying'),
      staticAbility({
        rules: {
          // CR 614.1a, 111.1; ruling 2: vale para as fichas criadas sob o seu controle
          tokenCreation: (c, ev) => (ev.player !== c.you || !ev.tokens.some((t) => ehArtefato(t, ev.player)) ? null : {
            label: 'Draconic Visitor: Dragons 5/5 vermelhos com voar no lugar das fichas de artefato',
            // ruling 1: as características são trocadas por inteiro; virada, atacando etc. continuam valendo
            *replace(e) { return { ...e, tokens: e.tokens.map((t) => (ehArtefato(t, e.player) ? { de: t.de, def: DRAGAO } : t)) }; },
          }),
        },
        text: 'Se uma ou mais fichas de artefato fossem ser criadas sob o seu controle, em vez disso é criada a mesma quantidade de fichas de criatura Dragon vermelhas 5/5 com voar.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: os Tesouros que você criaria viram Dragons 5/5 com voar, virados se fossem virados; outras fichas, não',
    2: 'regra geral: CR 111.1 — vale para as fichas criadas sob o seu controle (motor/actions.ts substituirFichas)',
    3: 'regra geral: CR 614.1 — só vale para a ficha que seria criada como artefato',
  },
});
