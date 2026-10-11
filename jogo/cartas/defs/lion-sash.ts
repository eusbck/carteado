// Lion Sash
// {W}: Exile target card from a graveyard. If it was a permanent card, put a +1/+1 counter on this permanent.
// Equipped creature gets +1/+1 for each +1/+1 counter on this Equipment.
// Reconfigure {2} ({2}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery.
// While attached, this isn't a creature.)
import { activated, addCounters, attachedGets, defineCard, exile, is, reconfigure, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Lion Sash',
  faces: [{
    abilities: [
      activated('{W}', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // "se era uma carta de permanente": olha a carta antes de exilar
        const permanente = is.permanentCard({ g: c.g, you: c.you, source: c.source }, id);
        const [ex] = yield* exile(c.g, [id]);
        if (ex !== null && ex !== undefined && permanente && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { targets: [t.card('graveyard', undefined, 'carta alvo de um cemitério', 'any')], text: '{W}: Exile a carta alvo de um cemitério. Se era uma carta de permanente, coloque um marcador +1/+1 neste permanente.' }),
      attachedGets((c) => { const n = c.g.state.objects[c.source]?.counters['+1/+1'] ?? 0; return n > 0 ? [{ k: 'pt', p: n, t: n }] : []; }, 'A criatura equipada recebe +1/+1 para cada marcador +1/+1 neste Equipamento.'),
      // CR 702.151a-b
      ...reconfigure('{2}'),
    ],
  }],
  rulings: {
    1: 'teste: reconfigurar {2}: anexado, deixa de ser criatura e a criatura equipada recebe +1/+1 por marcador; desanexado, volta a ser criatura',
    2: 'regra geral: CR 702.151b — anexado, deixa de ser criatura e perde os tipos de criatura (motor/criaturas.ts reconfigure)',
    3: 'regra geral: CR 301.5 — o Equipamento não vira quando a criatura equipada vira',
    4: 'regra geral: CR 702.151a — virado, ainda pode reconfigurar; anexar não o desvira',
    5: 'regra geral: CR 702.151b — o efeito de não ser criatura dura até ser desanexado (motor/criaturas.ts reconfigure)',
    6: 'regra geral: CR 704.5n — ao deixar de ser criatura, Equipamentos e Auras de criatura presos a ele soltam (motor/sba.ts)',
    7: 'regra geral: CR 301.5c — com reconfigurar, pode ser anexado por outros efeitos (motor/actions.ts attach)',
    8: 'regra geral: CR 702.151a — reconfigurar não é habilidade de equipar (a palavra-chave registrada é reconfigure)',
    9: 'regra geral: CR 702.151a — só anexa a outra criatura; nunca a si mesmo (motor/criaturas.ts reconfigure)',
    10: 'regra geral: CR 704.5n — se ainda for criatura depois de anexado, solta na hora (motor/sba.ts)',
  },
});
