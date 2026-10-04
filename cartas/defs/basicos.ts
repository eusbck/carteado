// Terrenos básicos: a habilidade de mana vem do tipo de terreno básico (CR 305.6).
import { defineCard } from '../../motor/api.ts';

for (const name of ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest']) defineCard({ name, faces: [{}] });
