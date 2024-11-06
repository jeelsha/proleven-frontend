import { AllEventHover } from 'components/ReactCalendar/components/Hover/AllEventHover';
import { InternalEventHover } from 'components/ReactCalendar/components/Hover/InternalEventHover';
import 'components/ReactCalendar/style/calendar.css';
import { EventHoverProps } from 'components/ReactCalendar/types';
import { CSSProperties } from 'react';

export const EventHover = ({
  position,
  className,
  hoveredEvent,
  user,
}: EventHoverProps) => {
  return (
    <div style={position as CSSProperties} className={`popover ${className}`}>
      <div className="event-container" style={{ height: '100%' }}>
        {hoveredEvent?.course ? (
          <AllEventHover hoveredEvent={hoveredEvent} user={user} />
        ) : (
          <InternalEventHover hoveredEvent={hoveredEvent} />
        )}
      </div>
    </div>
  );
};
