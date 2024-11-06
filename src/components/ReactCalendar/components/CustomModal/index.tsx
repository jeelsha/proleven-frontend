import { EventHover } from 'components/ReactCalendar/components/Hover/EventHover';
import { CustomModalProps } from 'components/ReactCalendar/types';

export const CustomModal = ({
  taskInfo,
  className,
  user,
  position,
}: CustomModalProps) => {
  return (
    <EventHover
      position={position}
      className={className}
      hoveredEvent={taskInfo}
      user={user}
    />
  );
};
