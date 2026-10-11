// Hungry Lynx
// Cats you control have protection from Rats. (They can't be blocked, targeted, or dealt damage by Rats.)
// At the beginning of your end step, target opponent creates a 1/1 black Rat creature token with deathtouch.
// Whenever a Rat dies, put a +1/+1 counter on each Cat you control.
import { addCounters, and, anthem, controlledBy, createTokens, defineCard, is, isSubtype, on, t, tgtPlayer, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Hungry Lynx',
  faces: [{
    abilities: [
      // CR 702.16a: proteção contra um subtipo; vale para todos os seus Cats, inclusive a própria Lynx
      anthem(and(is.subtype('Cat'), is.yours), () => [{ k: 'addKeyword', kw: 'protection', param: 'subtype:Rat' }], 'Os Cats que você controla têm proteção contra Rats.'),
      // ruling 3: o oponente cria a ficha e é o dono dela
      triggered(on.endStep('you'), function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) yield* createTokens(c.g, p, 'Rat toque mortífero', 1);
      }, { targets: [t.opponent()], text: 'No início da sua etapa final, o oponente alvo cria uma ficha de criatura Rat 1/1 preta com toque mortífero.' }),
      // ruling 4: fichas também morrem; ruling 5: todos os seus Cats, inclusive a Lynx; ruling 6: quem morreu junto não recebe
      triggered(on.dies((_c, lki) => lki.subtypes.includes('Rat')), function* (c) {
        for (const id of controlledBy(c.g, c.you, (x) => isSubtype(c.g, x, 'Cat'))) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que um Rat morre, coloque um marcador +1/+1 em cada Cat que você controla.' }),
    ],
  }],
  rulings: {
    1: 'teste: os seus Cats têm proteção contra Rats: o Rat não os bloqueia',
    2: 'regra geral: CR 702.16b — a proteção só impede dano, anexar, bloquear e ser alvo; a Lynx pode bloquear um Rat (motor/combat.ts)',
    3: 'teste: na sua etapa final, o oponente alvo cria um Rat 1/1 com toque mortífero',
    4: 'teste: quando um Rat morre, mesmo ficha, cada Cat seu ganha um marcador +1/+1',
    5: 'teste: quando um Rat morre, mesmo ficha, cada Cat seu ganha um marcador +1/+1',
    6: 'regra geral: CR 603.10a — o gatilho de morrer dispara mesmo que a Lynx morra junto; o marcador só vai para os Cats que estão no campo na resolução',
  },
});
