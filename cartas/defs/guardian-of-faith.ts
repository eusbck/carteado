// Guardian of Faith
// Flash
// Vigilance
// When this creature enters, any number of other target creatures you control phase out. (Treat them and anything
// attached to them as though they don't exist until their controller's next turn.)
import { and, defineCard, etb, is, keywords, phaseOut, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Guardian of Faith',
  faces: [{
    abilities: [
      ...keywords('flash', 'vigilance'),
      etb(function* (c) {
        const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield' ? [r.id] : []));
        // rulings 1-8: sair de fase (CR 702.26) — Auras e Equipamentos saem juntos
        phaseOut(c.g, ids);
      }, {
        targets: [{ ...t.creature(and(is.yours, is.other), 'outras criaturas alvo que você controla'), min: 0, max: 99 }],
        text: 'Quando esta criatura entra, qualquer número de outras criaturas alvo que você controla saem de fase.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: fora de fase não pode ser alvo nem bloquear',
    2: 'teste: sair e voltar de fase não dispara entrar/sair',
    3: 'regra geral: CR 702.26 — efeitos "enquanto" ignoram objetos fora de fase',
    4: 'teste: volta na etapa de desvirar do controlador, com os marcadores',
    5: 'não se aplica: o motor volta de fase pelo controlador que a fez sair; troca de controle temporária com fase não ocorre nos decks',
    6: 'teste: atacante que sai de fase deixa o combate',
    7: 'teste: a Aura anexada sai e volta junto',
    8: 'regra geral: CR 702.26d — escolhas feitas ao entrar são lembradas',
  },
});
