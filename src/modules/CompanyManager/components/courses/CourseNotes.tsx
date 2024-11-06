// ** imports **
import { useTranslation } from 'react-i18next';

// ** types **
import { CourseNotesProps } from 'modules/CompanyManager/types';

export const CourseNotes = ({ courseNotes }: CourseNotesProps) => {
  const { t } = useTranslation();
  return (
    <div className="mt-7">
      <p className="text-2xl leading-[1.3] font-bold text-dark mb-5">
        {t('CompanyManager.courseDetails.notesTitle')}
      </p>
      <ul className="list-disc ps-5 flex flex-col gap-4">
        {Array.isArray(courseNotes) &&
          courseNotes.length > 0 &&
          courseNotes.map((notes, index: number) => {
            return (
              <li
                className="text-base font-medium leading-6 text-dark"
                key={`notes_${index + 1}`}
              >
                {notes.content}
              </li>
            );
          })}
      </ul>
    </div>
  );
};
