// Stridehangar Automaton
// Thopters you control get +1/+1.
// If one or more artifact tokens would be created under your control, those tokens plus an additional 1/1 colorless
// Thopter artifact creature token with flying are created instead.
import { and, anthem, copyValuesChars, defineCard, is, printedChars, staticAbility } from '../../motor/api.ts';
import type { TokenCreation } from '../../motor/defs.ts';
import type { PlayerId } from '../../motor/types.ts';

/** a ficha que seria criada é um artefato? (pelas características dela, também numa cópia) */
function ehArtefato(p: PlayerId, x: TokenCreation['tokens'][number]): boolean {
  const ch = x.copyOf ? copyValuesChars(x.copyOf, p) : x.def ? printedChars(x.def, 0, p) : null;
  return !!ch && ch.types.includes('Artifact');
}

export default defineCard({
  name: 'Stridehangar Automaton',
  faces: [{
    abilities: [
      anthem(and(is.subtype('Thopter'), is.yours), () => [{ k: 'pt', p: 1, t: 1 }], 'Thopters que você controla recebem +1/+1.'),
      // CR 614.1a; ruling 4: com outras substituições (Mondrak, Anointed Procession), você escolhe a ordem (CR 616.1)
      staticAbility({
        rules: {
          tokenCreation: (c, ev) => (ev.player !== c.you || !ev.tokens.some((x) => ehArtefato(ev.player, x)) ? null : {
            label: 'Stridehangar Automaton: mais uma ficha Thopter',
            // ruling 1: o Thopter acompanha o resto do pedido (virado, atacando…), sem as habilidades das outras fichas
            *replace(e) {
              const primeira = e.tokens.find((x) => ehArtefato(e.player, x))!;
              return { ...e, tokens: [...e.tokens, { de: primeira.de, def: 'Thopter' }] };
            },
          }),
        },
        text: 'Se uma ou mais fichas de artefato fossem ser criadas sob o seu controle, essas fichas mais uma ficha de criatura artefato Thopter 1/1 incolor com voar são criadas em vez disso.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: criando um Treasure, cria também um Thopter 1/1 voador, que recebe +1/+1',
    2: 'teste: uma ficha de criatura que não é artefato não traz o Thopter; as do oponente também não',
    3: 'regra geral: CR 614.1a — quem controla a ficha é decidido antes desta substituição (motor/actions.ts putOntoBattlefield)',
    4: 'teste: com Mondrak, você escolhe a ordem: dobrar primeiro e depois o Thopter, ou o contrário',
    5: 'regra geral: CR 707.10 — cópia de mágica de permanente vira ficha sem ser "criada" (motor/stack.ts)',
  },
});
