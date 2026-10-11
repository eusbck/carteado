// Nacatl War-Pride
// This creature must be blocked by exactly one creature if able.
// Whenever this creature attacks, create X tokens that are copies of it and that are tapped and attacking, where X is the
// number of creatures defending player controls. Exile the tokens at the beginning of the next end step.
import { controllerOf, copiableValues, creaturesOf, defineAbility, defineCard, delayed, exile, nextEndStepTrigger, on, putOntoBattlefield, staticAbility, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { escolheAtacado } from '../viloes.ts';

const EXILA = defineAbility('Nacatl War-Pride:exila', nextEndStepTrigger(function* (c) {
  const ids = ((c.data.fichas as ObjId[] | undefined) ?? []).filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
  if (ids.length) yield* exile(c.g, ids);
}, 'Exile as fichas no início da próxima etapa final.'));

export default defineCard({
  name: 'Nacatl War-Pride',
  faces: [{
    abilities: [
      // CR 509.1c: exigência de bloqueio; ruling 1: se for impossível (ameaçar, por exemplo), o defensor bloqueia como quiser
      staticAbility({ rules: { mustBeBlockedByExactlyOne: (c, atacante) => atacante === c.source }, text: 'Esta criatura precisa ser bloqueada por exatamente uma criatura se puder.' }),
      triggered(on.selfAttacks(), function* (c) {
        const a = c.g.state.combat?.attackers.find((x) => x.id === c.source);
        if (!a) return;
        const defensor = a.target.kind === 'player' ? a.target.id : controllerOf(c.g, a.target.id);
        const x = creaturesOf(c.g, defensor).length;
        if (x <= 0) return;
        // rulings 2-3: copia o que ela é agora, ou a última informação se já saiu do campo
        const copia = copiableValues(c.g, c.source);
        // ruling 6: você escolhe quem as fichas atacam (aqui, uma escolha só para todas)
        const alvo = yield* escolheAtacado(c, 'Nacatl War-Pride');
        // rulings 4-5: entram atacando sem terem sido declaradas
        const fichas = yield* putOntoBattlefield(c.g, Array.from({ length: x }, () => ({ controller: c.you, token: { copyOf: copia }, tapped: true, attacking: alvo ?? undefined })), 'token');
        if (fichas.length) delayed(c, EXILA.id!, { data: { fichas } });
      }, { text: 'Sempre que esta criatura ataca, crie X fichas que são cópias dela, viradas e atacando, onde X é o número de criaturas que o jogador defensor controla. Exile as fichas no início da próxima etapa final.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 509.1c — com ameaçar a exigência é impossível e deixa de valer (motor/combat.ts mustBeBlockedByOne)',
    2: 'regra geral: CR 707.2 — as fichas copiam pela última informação se ela já saiu do campo (motor/mecanicas.ts copiableValues)',
    3: 'regra geral: CR 707.3 — as fichas copiam o que ela estiver copiando na resolução (motor/mecanicas.ts copiableValues)',
    4: 'teste: ao atacar, cria uma cópia virada e atacando para cada criatura do defensor, exiladas na etapa final',
    5: 'regra geral: CR 506.3 — as fichas entram atacando sem terem sido declaradas: os gatilhos de atacar delas não disparam',
    6: 'regra geral: CR 508.4 — você escolhe quem as fichas atacam (cartas/viloes.ts escolheAtacado; uma escolha para todas)',
  },
});
