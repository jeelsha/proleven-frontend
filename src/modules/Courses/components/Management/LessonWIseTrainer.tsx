// ** Components **
import ReactSelect from 'components/FormElement/ReactSelect';
import { REACT_APP_DATE_FORMAT } from 'config';

// ** date-fns **
import { format, parseISO } from 'date-fns';

// ** Types **
import { ICourseTrainer } from 'modules/Courses/types';
import { LessonWIseTrainerProps } from 'modules/Courses/types/TrainersAndRooms';

// ** Hooks **
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LessonWIseTrainer = ({
  values,
  lessonTrainers,
  setFieldValue,
}: LessonWIseTrainerProps) => {
  const { t } = useTranslation();
  // ** CONSTs
  const { course, lesson } = values;
  const { main_trainers = [] } = course;

  const getTrainerList = (index: number) => {
    const currentTrainerList = lessonTrainers?.[index];
    return (currentTrainerList ?? []).map((t) => ({
      label: t.name,
      value: t.id,
    }));
  };

  const updateMainTrainers = (
    mainTrainers: Array<ICourseTrainer>,
    ids: Set<number>
  ) => {
    ids.forEach((id) => {
      if (!mainTrainers.some((t) => t.assigned_to === id)) {
        mainTrainers.push({ assigned_to: id, is_lesson_trainer: true });
      }
    });
    return mainTrainers.filter(
      (t) => !(t.is_lesson_trainer && !ids.has(t.assigned_to))
    );
  };

  useEffect(() => {
    const sessionsTrainerIds = (lesson ?? [])
      .flatMap((l) => l.session ?? [])
      .flatMap((s) => s.main_trainers ?? []);

    const mainTrainers = updateMainTrainers(
      main_trainers ?? [],
      new Set(sessionsTrainerIds)
    );

    setFieldValue?.('course.main_trainers', mainTrainers);
  }, [lesson]);

  return (
    <div className="grid gap-4">
      {(lesson ?? []).map((item, index) => {
        const date = item?.date ? format(parseISO(item.date), (REACT_APP_DATE_FORMAT as string)) : '';
        return (
          <div key={`ITEM_${index + 1}`}>
            <div className="flex gap-2 justify-between mb-[8px] text-[14px]">
              <span>{item?.title}</span>
              <span className="text-secondary">{date}</span>
            </div>
            <div className="grid gap-3">
              {(item?.session ?? []).map((_session, ind) => {
                return (
                  <ReactSelect
                    key={`SESSION_${ind + 1}`}
                    name={`lesson[${index}].session[${ind}].main_trainers`}
                    options={getTrainerList(index)}
                    placeholder={t('CoursesManagement.CreateCourse.selectTrainer')}
                    isMulti
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LessonWIseTrainer;
