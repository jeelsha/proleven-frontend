import { Link } from 'react-router-dom';
import { ObjectOption } from '../types';

export const customFormatLabel = (
  optionObject: ObjectOption,
  condition?: string
) => {
  switch (condition) {
    case 'courseRecover': {
      const { recoveryCourseItem } = optionObject;
      return (
        <div className="my-2">
          <div className="font-semibold">
            <Link
              className="hover:underline"
              to={`/courses/view/${recoveryCourseItem?.slug}`}
              target="_blank"
            >
              {recoveryCourseItem?.progressive_number} - {recoveryCourseItem?.title}
            </Link>
          </div>
          <div>
            {recoveryCourseItem?.start_date} - {recoveryCourseItem?.end_date}
            {' - '}
            {recoveryCourseItem?.mode} - {recoveryCourseItem?.type}
          </div>
        </div>
      );
    }

    default: {
      return <></>;
    }
  }
};
