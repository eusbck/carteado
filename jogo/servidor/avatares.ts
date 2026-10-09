// Catálogo dos retratos dos jogadores (avatares na mesa). Os retratos foram feitos pelo Caio, um por comandante dos
// decks da mesa, mas o avatar não fica preso ao deck: cada pessoa escolhe o seu. Quem não escolheu usa o do
// comandante do próprio deck, se houver um, ou um medalhão com a inicial. As imagens ficam em
// cliente/src/imagens/avatares/<id>.webp; o servidor só usa a lista para validar a escolha.

export interface Avatar {
  id: string;
  nome: string;
  /** o deck de onde o retrato veio (só para mostrar na escolha) */
  deck: string;
  /** comandante cujo deck usa este retrato quando a pessoa não escolheu outro */
  comandante: string;
  /** cor da aura atrás do retrato */
  aura: string;
}

export const AVATARES: Avatar[] = [
  { id: 'felothar', nome: 'Felothar', deck: 'Abzan Armor', comandante: 'Felothar the Steadfast', aura: '#e2b866' },
  { id: 'auntie-ool', nome: 'Auntie Ool', deck: 'Blight Curse', comandante: 'Auntie Ool, Cursewretch', aura: '#9a7fd1' },
  { id: 'quintorius', nome: 'Quintorius', deck: 'Lorehold Spirit', comandante: 'Quintorius, History Chaser', aura: '#ef7b3c' },
  { id: 'jace', nome: 'Jace', deck: 'Multiverse Reforged', comandante: 'Jace, Multiverse Architect', aura: '#3fa2f0' },
  { id: 'rootha', nome: 'Rootha', deck: 'Prismari Artistry', comandante: 'Rootha, Mastering the Moment', aura: '#ec4a96' },
  { id: 'killian', nome: 'Killian', deck: 'Silverquill Influence', comandante: 'Killian, Decisive Mentor', aura: '#e9dcae' },
  { id: 'terra', nome: 'Terra', deck: 'Terra', comandante: 'Terra, Herald of Hope', aura: '#f07fd0' },
  { id: 'dina', nome: 'Dina', deck: 'Witherbloom Pestilence', comandante: 'Dina, Essence Brewer', aura: '#93e04f' },
  { id: 'gisa', nome: 'Gisa', deck: 'Wretched Ranks', comandante: 'Ghoulcaller Gisa', aura: '#a99bc9' },
];

export const avatarValido = (x: unknown): x is string => typeof x === 'string' && AVATARES.some((a) => a.id === x);

/** o retrato de quem não escolheu: o do comandante do deck, se houver */
export const avatarDoComandante = (comandante: string | null | undefined): string | null =>
  (comandante ? AVATARES.find((a) => a.comandante === comandante)?.id : null) ?? null;
