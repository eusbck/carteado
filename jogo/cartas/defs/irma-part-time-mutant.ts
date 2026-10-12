// Irma, Part-Time Mutant
// At the beginning of combat on your turn, Irma becomes a copy of up to one other target creature you control, except
// her name is Irma, Part-Time Mutant and she has this ability. Then put a +1/+1 counter on her.
import { addCounters, and, becomeCopy, defineAbility, defineCard, is, on, t, triggered, upTo } from '../../motor/api.ts';
import type { TriggeredDef } from '../../motor/defs.ts';

const NOME = 'Irma, Part-Time Mutant';

const COPIA: TriggeredDef = defineAbility('Irma, Part-Time Mutant:copia', triggered(on.beginCombat('you'), function* (c) {
  if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
  // ruling 1: sem alvo, só o marcador; com o alvo ilegal a habilidade nem resolve (CR 608.2b)
  const r = c.targets[0]?.[0];
  if (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield') becomeCopy(c, c.source, r.id, { except: { name: NOME, addAbilities: [COPIA.id!] } });
  addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
}, {
  targets: [upTo(1, t.creature(and(is.yours, is.other), 'outra criatura alvo que você controla'))],
  text: 'No início do combate no seu turno, Irma vira uma cópia de até uma outra criatura alvo que você controla, exceto que o nome dela é Irma, Part-Time Mutant e ela tem esta habilidade. Depois, coloque um marcador +1/+1 nela.',
}));

export default defineCard({
  name: NOME,
  faces: [{ abilities: [COPIA] }],
  rulings: {
    1: 'regra geral: CR 608.2b — com o alvo escolhido ilegal, a habilidade não resolve: nem cópia nem marcador (motor/stack.ts)',
    2: 'regra geral: CR 707.2 — copia só os valores copiáveis, com as exceções: não copia estar virada, marcadores nem anexos (motor/criaturas.ts becomeCopy)',
    3: 'regra geral: CR 707.2 — o X do custo de mana copiado vale 0 (motor/chars.ts)',
    4: 'regra geral: CR 707.3 — se o modelo é cópia de outra coisa, Irma copia o que ele copiou (motor/mecanicas.ts copiableValues)',
    5: 'teste: no início do seu combate vira cópia de outra criatura sua, com o nome e a habilidade dela, e ganha um marcador +1/+1',
  },
});