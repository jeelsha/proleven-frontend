// ** imports **

// ** components **
import CustomCard from 'components/Card';

// ** hooks **
import { useQueryGetFunction } from 'hooks/useQuery';

// ** types **
import _ from 'lodash';
import { AttendeeResultShow } from 'modules/Courses/components/AttendeeExamResult/AttendeeResultShow';
import { AttendeeExamListViewProps } from 'modules/Courses/types/survey';
import { useLocation } from 'react-router-dom';

const AttendeeExamListView = ({
  examSlug,
  participateSlug,
  courseSlug,
}: AttendeeExamListViewProps) => {
  const { state } = useLocation();

  const { response } = useQueryGetFunction(`/exam/attendee-result`, {
    option: {
      exam_slug: examSlug,
      exam_participate_slug: participateSlug,
      course_slug: courseSlug,
      ...(!_.isEmpty(state) &&
        state.publish_course_slug && {
        publish_course_slug: state.publish_course_slug,
      }),
    },
  });
  return (
    <section>
      <CustomCard minimal>
        <div>
          <div className="flex gap-x-2">
            <p className="text-xl font-semibold text-dark">
              {response?.data?.attendees?.first_name}
            </p>
            <p className="text-xl font-semibold text-dark">
              {response?.data?.attendees?.last_name}
            </p>
          </div>
          {(response?.data?.attendees?.email || response?.data?.attendees?.mobile_number) && <p className="text-sm">
            {response?.data?.attendees?.email} |
            {response?.data?.attendees?.mobile_number}
          </p>}
          {response?.data?.attendees?.code &&
            <p className="text-lg  text-dark">
              {response?.data?.attendees?.code}
            </p>
          }
        </div>
      </CustomCard>
      <div className="flex flex-wrap justify-between gap-y-3.5 flex-col">
        <AttendeeResultShow response={response?.data} />
      </div>
    </section>
  );
};

export default AttendeeExamListView;
