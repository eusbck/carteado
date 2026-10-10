// Propaganda
// Creatures can't attack you unless their controller pays {2} for each creature they control that's attacking you.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: "Propaganda",
  faces: [{ abilities: [staticAbility({ rules: { attackCost: (c, _a, target) => target.kind === 'player' && target.id === c.you ? 2 : 0 }, text: 'Para cada criatura que ataca você, seu controlador paga {2}.' })] }],
  rulings: {
    "1": "CR 508.1h: teste: o custo aplica-se ao jogador, não a seu planeswalker.",
    "2": "não se aplica: formato Gigante de Duas Cabeças fora do escopo; a mesa usa 1v1 ou Commander multiplayer.",
    "3": "CR 508.1h: o custo é verificado em cada declaração de atacantes, inclusive combates adicionais.",
    "4": "CR 508.1h: teste: duas Propagandas somam {4} por criatura.",
    "5": "CR 508.1h-j: o pagamento ocorre na declaração, antes de emitir o evento de ataque.",
    "6": "CR 508.1h-j, 117.2e: custo da declaração, sem usar a pilha; o motor permite cancelar e declarar novamente."
  },
});
