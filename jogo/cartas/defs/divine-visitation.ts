// Divine Visitation
// If one or more creature tokens would be created under your control, that many 4/4 white Angel creature tokens with
// flying and vigilance are created instead.
import { copyValuesChars, defineCard, staticAbility } from '../../motor/api.ts';
import { registry } from '../../motor/defs.ts';
import type { TokenCreation } from '../../motor/defs.ts';

const ANJO = 'Angel vigilância';

/** a ficha que seria criada é de criatura? (ruling 2: conta como ela seria criada, não o que viraria depois) */
function ehCriatura(t: TokenCreation['tokens'][number], dono: number): boolean {
  if (t.copyOf) return copyValuesChars(t.copyOf, dono).types.includes('Creature');
  return !!t.def && !!registry.tokens.get(t.def)?.types.includes('Creature');
}

export default defineCard({
  name: 'Divine Visitation',
  faces: [{
    abilities: [
      staticAbility({
        rules: {
          tokenCreation: (c, ev) => (ev.player !== c.you || !ev.tokens.some((t) => ehCriatura(t, ev.player) && t.def !== ANJO) ? null : {
            label: 'Divine Visitation: Angels 4/4 com voar e vigilância no lugar',
            // ruling 1: as características são trocadas por inteiro; virada, atacando etc. continuam valendo
            *replace(e) { return { ...e, tokens: e.tokens.map((t) => (ehCriatura(t, e.player) ? { de: t.de, def: ANJO } : t)) }; },
          }),
        },
        text: 'Se uma ou mais fichas de criatura fossem ser criadas sob o seu controle, em vez disso é criada a mesma quantidade de fichas de criatura Angel 4/4 brancas com voar e vigilância.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: as fichas de criatura que você criaria viram Angels 4/4 com voar e vigilância; as outras fichas, não',
    2: 'regra geral: CR 614.1 — só vale para a ficha que seria criada como criatura (cartas/defs/divine-visitation.ts)',
    3: 'regra geral: CR 616.1 — quem cria as fichas escolhe a ordem das substituições (motor/actions.ts createTokens)',
  },
});