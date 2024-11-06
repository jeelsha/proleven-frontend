// ** components **
import ActivityCard from './cards/ActivityCard';
import ProjectCard from './cards/ProjectCard';

// ** type **
import { ReactKanbanCardProps } from './types';

const ReactKanbanCard = ({
  cardType,
  card,
  cardModal,
  trainingSpecialistId,
  isOnClick = false,
}: ReactKanbanCardProps) => {
  return (
    <>
      {cardType === 'projectCard' ? (
        <ProjectCard
          trainingSpecialistId={trainingSpecialistId}
          isOnClick={isOnClick}
          cardModal={cardModal}
          card={card}
        />
      ) : (
        <ActivityCard isOnClick={isOnClick} cardModal={cardModal} card={card} />
      )}
    </>
  );
};

export default ReactKanbanCard;
