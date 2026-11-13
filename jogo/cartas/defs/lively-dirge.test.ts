import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Lively Dirge';

describe(NOME, () => {
  it('escolhe pelo menos um modo e paga o custo dele', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [[NOME], []], library: [['Island', 'Wall of Omens'], []] });
    tg.choose('escolha de 1 a 2 modo', ['+ {1} — Procure uma carta no seu grimório, coloque-a no seu cemitério e embaralhe']).choose('Procure', ['Wall of Omens']);
    tg.cast(NOME).resolve();
    expect(tg.names(0, 'graveyard').sort()).toEqual([NOME, 'Wall of Omens'].sort());
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped)).toHaveLength(3);
  });

  it('os dois modos: a carta buscada pode voltar com o segundo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[NOME], []], library: [['Island', 'Wall of Omens'], []], graveyard: [['Spellseeker', 'Zetalpa, Primal Dawn'], []] });
    tg.choose('escolha de 1 a 2 modo', ['+ {1} — Procure uma carta no seu grimório, coloque-a no seu cemitério e embaralhe', '+ {2} — Devolva até duas cartas de criatura com valor de mana total 4 ou menos do seu cemitério ao campo']);
    tg.choose('Procure', ['Wall of Omens']).choose('Lively Dirge: escolha', ['Wall of Omens (2)']);
    tg.cast(NOME).resolve();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped)).toHaveLength(5);
  });
});
