// Space Beleren
// Space sculptor (Space Beleren divides the battlefield into alpha, beta, and gamma sectors. If a creature isn't assigned
// to a sector, its controller assigns it to one. Opponents assign first.)
// +1: Creatures in each sector can be blocked this turn only by creatures in the same sector.
// −1: Put a +1/+1 counter on each creature in the sector of your choice.
// −5: Destroy all creatures in the sector of your choice.
import { activated, addCounters, allCreatures, chooseOne, controllerOf, defineAbility, defineCard, destroy, nameOf, ruleEffect, staticAbility } from '../../motor/api.ts';
import type { Ctx, Gen, StaticDef } from '../../motor/defs.ts';
import { eraDosSetores, ESCULTOR, escultores, SETORES, setorDe, type Setor } from '../../motor/setores.ts';

const NOME_DO_SETOR: Record<Setor, string> = { alpha: 'alfa', beta: 'beta', gamma: 'gama' };

// "+1": enquanto durar, a criatura de um setor só pode ser bloqueada por criaturas do mesmo setor. Sem Space Beleren no
// campo não há setores, e a restrição deixa de valer (ruling 5)
const SO_O_MESMO_SETOR = defineAbility<StaticDef>('Space Beleren:bloqueio', {
  kind: 'static',
  rules: {
    canBeBlockedBy: (c, atacante, bloqueador) => {
      const setor = setorDe(c.g, atacante);
      return setor === null || setorDe(c.g, bloqueador) === setor;
    },
  },
});

/** ruling 8: o setor é escolhido na resolução */
function* escolheSetor(c: Ctx, pergunta: string): Gen<Setor> {
  const conta = (st: Setor) => allCreatures(c.g).filter((id) => setorDe(c.g, id) === st).length;
  return (yield* chooseOne(c.g, c.you, pergunta, SETORES.map((x) => ({ id: x.id, label: `${x.label} (${conta(x.id)} criatura(s))` })))) as Setor;
}

export default defineCard({
  name: 'Space Beleren',
  faces: [{
    abilities: [
      {
        ...staticAbility({
          rules: {
            // rulings 1 e 4: ação baseada em estado. Quem controla uma criatura sem setor a põe num setor: primeiro os
            // jogadores que não controlam um escultor do espaço, em ordem de turno, depois os que controlam
            stateAction: function* (c) {
              const s = c.g.state;
              const es = escultores(c.g);
              if (!es.length) return false;
              // ruling 3: outro Space Beleren entra na era que já existe; ruling 5: sem nenhum, a próxima era é nova
              const era = eraDosSetores(c.g) ?? c.source;
              for (const id of es) s.objects[id].data.eraDosSetores = era;
              const semSetor = allCreatures(c.g).filter((id) => !s.objects[id].phasedOut && !(s.objects[id].data.setorEra === era && s.objects[id].data.setor !== undefined));
              if (!semSetor.length) return false;
              const controlam = new Set(es.map((id) => controllerOf(c.g, id)));
              const ordem = [...c.g.apnap().filter((p) => !controlam.has(p)), ...c.g.apnap().filter((p) => controlam.has(p))];
              for (const p of ordem) {
                for (const id of semSetor.filter((x) => controllerOf(c.g, x) === p)) {
                  const esc = yield* chooseOne(c.g, p, `Space Beleren: em qual setor fica ${nameOf(c.g, id)}?`, SETORES.map((x) => ({ id: x.id, label: x.label })));
                  // ruling 6: o setor fica com a criatura, mesmo que ela mude de controlador
                  s.objects[id].data.setor = esc;
                  s.objects[id].data.setorEra = era;
                  c.g.log(`${s.players[p].name} põe ${nameOf(c.g, id)} no setor ${NOME_DO_SETOR[esc as Setor]}.`);
                }
              }
              c.g.bump();
              return true;
            },
          },
          text: 'Escultor do espaço (Space Beleren divide o campo nos setores alfa, beta e gama. Se uma criatura não está num setor, quem a controla a põe em um. Os oponentes escolhem primeiro.)',
        }),
        kw: ESCULTOR,
      },
      activated('+1', function* (c) {
        // ruling 2: os setores só afetam o combate depois desta habilidade, e só neste turno
        ruleEffect(c, SO_O_MESMO_SETOR.id!, { kind: 'endOfTurn' });
      }, { text: '+1: As criaturas de cada setor só podem ser bloqueadas neste turno por criaturas do mesmo setor.' }),
      activated('−1', function* (c) {
        const setor = yield* escolheSetor(c, 'Space Beleren: ponha um marcador +1/+1 em cada criatura de qual setor?');
        for (const id of allCreatures(c.g).filter((x) => setorDe(c.g, x) === setor)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: '−1: Coloque um marcador +1/+1 em cada criatura do setor à sua escolha.' }),
      activated('−5', function* (c) {
        const setor = yield* escolheSetor(c, 'Space Beleren: destrua todas as criaturas de qual setor?');
        const ids = allCreatures(c.g).filter((x) => setorDe(c.g, x) === setor);
        if (ids.length) yield* destroy(c.g, ids);
      }, { text: '−5: Destrua todas as criaturas do setor à sua escolha.' }),
    ],
  }],
  rulings: {
    1: 'teste: com Space Beleren no campo, cada criatura é posta num setor, os oponentes primeiro',
    2: 'teste: +1: neste turno, a criatura de um setor só pode ser bloqueada por criaturas do mesmo setor',
    3: 'teste: um segundo Space Beleren não muda os setores já escolhidos',
    4: 'teste: a criatura que entra depois é posta num setor por quem a controla',
    5: 'teste: sem Space Beleren no campo os setores se perdem, e a restrição de bloqueio do +1 acaba',
    6: 'teste: a criatura que muda de controlador continua no mesmo setor',
    7: 'regra geral: CR 707.2 — o setor não é valor copiável: a cópia que entra é posta num setor por quem a controla (motor/setores.ts)',
    8: 'teste: −1 e −5: o setor é escolhido na resolução',
  },
});
