// ** imports **
import { useState } from 'react';

// ** components
import Image from 'components/Image';

// ** types **
import { CourseAccordionProps } from 'modules/CompanyManager/types';

export const CourseAccordion = ({ CourseFilters }: CourseAccordionProps) => {
  const [openFilters, setOpenFilters] = useState<number[]>([]);

  const toggleFilter = (index: number) => {
    if (openFilters.includes(index)) {
      setOpenFilters(openFilters.filter((item) => item !== index));
    } else {
      setOpenFilters([...openFilters, index]);
    }
  };

  return (
    <div className="mt-4 flex flex-col">
      {CourseFilters.map((item, index: number) => (
        <div key={`course_${index + 1}`} className="bg-white group">
          <div
            className="flex items-center cursor-pointer p-6 border border-solid border-borderColor border-b-0 group-first:border-b"
            onClick={() => toggleFilter(index)}
          >
            {item.title}
            <span
              className={`transform ${
                openFilters.includes(index)
                  ? 'rotate-90'
                  : '-rotate-90 translate-y-px'
              } transition-transform`}
            >
              <Image iconName="chevronLeft" />
            </span>
          </div>
          {openFilters.includes(index) && (
            <div className="bg-primaryLight p-6 border-t-0 border border-solid border-borderColor">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
