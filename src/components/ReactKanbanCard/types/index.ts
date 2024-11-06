import { UserModalType } from 'hooks/types';
import { Cards } from 'modules/ProjectManagement_module/types';

export interface ProjectCardProps {
  card?: Cards;
  cardModal?: UserModalType;
  url?: string;
  isOnClick?: boolean;
  trainingSpecialistId?: number;
}
export interface ActivityCardProps {
  card?: Cards;
  cardModal?: UserModalType;
  url?: string;
  isOnClick?: boolean;
}
export interface ReactKanbanCardProps {
  cardType?: 'projectCard' | 'activityCard';
  card?: Cards;
  cardModal?: UserModalType;
  url?: string;
  isOnClick?: boolean;
  trainingSpecialistId?: number;
}
export interface MyDivElement {
  id: string;
}
