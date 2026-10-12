// Codsworth, Handy Helper
// Commanders you control have ward {2}.
// {T}: Add {W}{W}. Spend this mana only to cast Aura and/or Equipment spells.
// {T}: Attach target Aura or Equipment you control to target creature you control. Activate only as a sorcery.
import { activated, and, anthem, attach, chars, defineCard, defineFn, is, mana, or, t, wardGranted, type G } from '../../motor/api.ts';
import { ehComandante } from '../vingadores.ts';

// ruling 2: só para conjurar mágicas de Aura ou de Equipamento (não paga equipar nem outras habilidades)
const RESTRICAO = 'Codsworth, Handy Helper:aurasEquipamentos';
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) =>
  purpose.kind === 'spell' && purpose.obj !== undefined && chars(g, purpose.obj).subtypes.some((s) => s === 'Aura' || s === 'Equipment'));

export default defineCard({
  name: 'Codsworth, Handy Helper',
  faces: [{
    abilities: [
      // ruling 1: depois de disparado, o resguardo resolve mesmo sem Codsworth (CR 113.7a)
      anthem(and(is.yours, (c, id) => ehComandante(c.g, id)), () => [{ k: 'addKeyword', kw: 'ward', param: '{2}' }, { k: 'addAbility', id: wardGranted('{2}') }], 'Os comandantes que você controla têm resguardo {2}.'),
      mana(() => [['W', 'W']], { restriction: RESTRICAO, text: '{T}: Adicione {W}{W}. Gaste essa mana somente para conjurar mágicas de Aura e/ou de Equipamento.' }),
      // rulings 3-5: basta controlar os dois alvos; se o anexo não puder ir para a criatura, nada muda
      activated('{T}', function* (c) {
        const anexo = c.targets[0]?.[0];
        const criatura = c.targets[1]?.[0];
        if (!anexo || !criatura || anexo.kind !== 'obj' || criatura.kind !== 'obj') return;
        if (c.g.state.objects[anexo.id]?.zone !== 'battlefield' || c.g.state.objects[criatura.id]?.zone !== 'battlefield') return;
        attach(c.g, anexo.id, criatura.id);
      }, {
        timing: 'sorcery',
        targets: [t.permanent(and(is.yours, or(is.subtype('Aura'), is.subtype('Equipment'))), 'Aura ou Equipamento alvo que você controla'), t.creature(is.yours, 'criatura alvo que você controla')],
        text: '{T}: Anexe a Aura ou o Equipamento alvo que você controla à criatura alvo que você controla. Ative somente como um feitiço.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 113.7a — o gatilho de resguardo já disparado resolve mesmo que o comandante perca o resguardo (motor/stack.ts)',
    2: 'regra geral: CR 106.6 — a mana com restrição só paga o que a restrição permite: mágicas de Aura ou Equipamento, não equipar (motor/costs.ts)',
    3: 'teste: {T}: anexa um Equipamento seu a uma criatura sua, esteja ele onde estiver',
    4: 'regra geral: CR 608.2b — com um dos alvos ilegal, a habilidade não faz nada; com os dois, não resolve (motor/stack.ts)',
    5: 'regra geral: CR 701.3b — se o anexo não pode ser anexado à criatura (proteção, por exemplo), ele não se move (motor/actions.ts attach)',
  },
});