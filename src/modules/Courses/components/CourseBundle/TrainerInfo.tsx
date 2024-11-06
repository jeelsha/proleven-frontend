// ** Components **
import BundleRooms from 'modules/Courses/components/CourseBundle/BundleRooms';
import BundleTrainers from 'modules/Courses/components/CourseBundle/BundleTrainers';
import ResourcesInfo from 'modules/Courses/components/ResourcesInfo/';

// ** Types **
import { SetFieldValue } from 'modules/Courses/types';
import { CourseBundleInterface } from 'modules/Courses/types/TemplateBundle';

interface TrainerInfoProps {
  values: CourseBundleInterface;
  setFieldValue: SetFieldValue;
  isLoading?: boolean;
  lessonDates: Array<string>;
  timeSlots?: Array<string>;
}

const TrainerInfo = ({
  values,
  setFieldValue,
  isLoading,
  lessonDates,
  timeSlots,
}: TrainerInfoProps) => {
  const { courses } = values;
  const slugs = (courses ?? []).map((c) => c.course.slug);
  return (
    <>
      {slugs?.length > 0 ? (
        <>
          <BundleTrainers
            values={values}
            dates={lessonDates}
            isLoading={isLoading}
            setFieldValue={setFieldValue}
            timeSlots={timeSlots}
            course_slug={(slugs ?? []).filter(Boolean).join(',')}
          />
          <div className="bg-primaryLight gap-4 grid grid-cols-2 my-5 pb-8 pt-5 px-9 rounded-xl">
            <BundleRooms
              values={values}
              isLoading={isLoading}
              dates={lessonDates}
              setFieldValue={setFieldValue}
              timeSlots={timeSlots}
            />
          </div>
          <div className="grid gap-4">
            <ResourcesInfo
              bundleValues={values}
              main_resources={values.other?.main_resources ?? []}
              optional_resources={values.other?.optional_resources ?? []}
              setFieldValue={setFieldValue}
              parentObjectName="other"
              isOptionalRequired={!!values?.other?.optional_trainers?.length}
              isLoading={isLoading}
              dates={lessonDates}
              timeSlots={timeSlots}
              course_slug={(slugs ?? []).filter(Boolean).join(',')}
            />
          </div>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default TrainerInfo;
