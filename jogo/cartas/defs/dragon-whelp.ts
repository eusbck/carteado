// Dragon Whelp
// Flying
// {R}: This creature gets +1/+0 until end of turn. If this ability has been activated four or more times this turn,
// sacrifice this creature at the beginning of the next end step.
import { activated, defineAbility, defineCard, delayed, keyword, nextEndStepTrigger, sacrifice } from '../../motor/api.ts';
import { bombeia } from '../inferno.ts';

const SACRIFICA = defineAbility('Dragon Whelp:sacrifica', nextEndStepTrigger(function* (c) {
  if (c.g.state.objects[c.source]?.zone === 'battlefield') yield* sacrifice(c.g, [c.source]);
}, 'No início da próxima etapa final, sacrifique Dragon Whelp.'));

export default defineCard({
  name: 'Dragon Whelp',
  faces: [{
    abilities: [
      keyword('flying'),
      activated('{R}', function* (c) {
        bombeia(c, 1, 0);
        // rulings 1 e 3: a partir da quarta vez no turno, cada resolução cria um gatilho atrasado de sacrificar
        const s = c.g.state;
        const chave = `dragon-whelp:${c.source}`;
        s.turnCounters[chave] = (s.turnCounters[chave] ?? 0) + 1;
        c.g.bump();
        if (s.turnCounters[chave] >= 4 && s.objects[c.source]?.zone === 'battlefield') delayed(c, SACRIFICA.id!);
      }, { text: '{R}: Esta criatura recebe +1/+0 até o fim do turno. Se esta habilidade foi ativada quatro ou mais vezes neste turno, sacrifique esta criatura no início da próxima etapa final.' }),
    ],
  }],
  rulings: {
    1: 'teste: ativada quatro vezes no turno, é sacrificada no início da próxima etapa final',
    2: 'regra geral: CR 603.7 — o gatilho atrasado criado durante a etapa final espera a etapa final seguinte (motor/efeitos.ts nextEndStepTrigger)',
    3: 'teste: ativada três vezes, só recebe +3/+0',
    4: 'regra geral: CR 603.7 — o gatilho atrasado criado durante a etapa final espera a etapa final seguinte (motor/efeitos.ts nextEndStepTrigger)',
  },
});