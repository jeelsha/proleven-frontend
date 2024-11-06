// ** Components **
import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import ReactSelect from 'components/FormElement/ReactSelect';
import Image from 'components/Image';
import ReactEditor from 'components/ReactQuillEditor/ReactQuillEditor';

// ** Formik **
import { FieldArray, FieldArrayRenderProps } from 'formik';

// ** Hooks **
import { useQueryGetFunction } from 'hooks/useQuery';
import { useTranslation } from 'react-i18next';

// ** Types **
import { Lesson } from 'modules/Courses/types';
import {
  CertificateInfoProps,
  CertificateTemplate,
} from 'modules/Courses/types/CertificateTemplate';

// ** Utils **
import { Option } from 'components/FormElement/types';
import { useEffect, useState } from 'react';
import { shouldDisableField } from 'utils';

const CertificateInfo = ({
  lessons,
  fieldsToTranslate,
  currentLanguage,
  defaultLanguage,
  isMainLoading,
  is_external_certificate,
  certificate_id,
  setFieldValue,
  setFieldTouched,
}: CertificateInfoProps) => {
  const { t } = useTranslation();

  // ** States
  const [certificateId, setCertificateId] = useState<number>();

  // ** APIs
  const { response } = useQueryGetFunction(
    '/certificate-templates',
    {
      option: {
        includeMainTemplate: true,
      },
    },
    { 'accept-custom-language ': currentLanguage ?? '' }
  );

  // ** CONSTs
  const responseData: Array<CertificateTemplate> =
    response?.data?.data &&
    Array.isArray(response?.data?.data) &&
    response?.data?.data?.length > 0
      ? response?.data?.data
      : [];

  const certificateOptions = (responseData ?? []).map((item) => ({
    value: item.id,
    label: item.title,
  }));

  const getMainCertificateOptions = (id?: number) => {
    const options = (responseData ?? []).find((item) => item.id === id);
    if (options)
      return options?.mainTemplate.map((item) => ({
        label: item.title,
        value: item.id,
      }));
    return [];
  };

  const getCertificateIdFromMainCertificateId = (id: number) => {
    const foundItem = (responseData ?? []).find((item) =>
      item.mainTemplate.some((template) => template.id === id)
    );
    if (foundItem?.id) setCertificateId(foundItem.id);
  };

  const handleAddTopic = (arrayHelpers: FieldArrayRenderProps): void => {
    arrayHelpers.push({ topic: '', is_external_certificate });
  };

  const isDisabled = (val: string) =>
    shouldDisableField(val, fieldsToTranslate, currentLanguage, defaultLanguage);

  const renderTopics = (
    lesson: Lesson,
    topicArrayHelpers: FieldArrayRenderProps,
    index: number
  ) => {
    return (
      <>
        <div className="flex justify-between mb-2 items-center border-b border-solid border-borderColor pb-2.5">
          <p className="text-base text-dark font-semibold">
            {`${t('CoursesManagement.CreateCourse.lesson')} ${index + 1}`}
            {!is_external_certificate ? (
              <span className="text-red-700 text-sm font-normal">*</span>
            ) : (
              ''
            )}
          </p>
          <Button
            disabled={isDisabled('') || isMainLoading}
            onClickHandler={() => handleAddTopic(topicArrayHelpers)}
            variants="primary"
            className="w-10 h-10 !p-2 inline-block"
          >
            <Image iconClassName="w-full h-full" iconName="plusIcon" />
          </Button>
        </div>
        {(lesson?.topics ?? []).map((_, ind) => {
          return (
            <div
              key={`Topic_${ind + 1}`}
              className="flex items-center w-full justify-between"
            >
              <ReactEditor
                parentClass={`${
                  (lessons?.[index]?.topics ?? []).length > 1 &&
                  'w-full max-w-[calc(100%_-_50px)] pe-8'
                }`}
                name={`lesson.[${index}].topics.[${ind}].topic`}
                // placeholder={t('CoursesManagement.CreateCourse.topicPlaceHolder')}
                isCompulsory={!is_external_certificate}
                setFieldValue={setFieldValue}
                setFieldTouched={setFieldTouched}
                value={lesson?.topics?.[ind]?.topic ?? ''}
                disabled={isDisabled('topic')}
                isLoading={isMainLoading}
              />
              {(lessons?.[index]?.topics ?? []).length > 1 ? (
                <Button
                  disabled={isDisabled('') || isMainLoading}
                  className="button dangerBorder w-10 h-10 !p-2 inline-block"
                  onClickHandler={() => topicArrayHelpers.remove(ind)}
                >
                  <Image iconName="deleteIcon" iconClassName="w-6 h-6" />
                </Button>
              ) : (
                ''
              )}
            </div>
          );
        })}
      </>
    );
  };

  // ** useEffects
  useEffect(() => {
    if (certificate_id) {
      getCertificateIdFromMainCertificateId(certificate_id);
    }
  }, [certificate_id, response]);

  return (
    <div className="bg-primaryLight rounded-xl">
      <div className="flex flex-wrap 1024:px-9 px-4 1024:py-8 py-5">
        <p className="text-xl leading-6 font-semibold">
          {t('CoursesManagement.CreateCourse.certificate')}
        </p>
      </div>
      <div className="1024:px-9 px-4 1024:pb-8 pb-5">
        <div className="gap-7 grid 1024:grid-cols-3 grid-cols-1">
          <InputField
            parentClass="flex-[1_0_0%]"
            placeholder={t(
              'CoursesManagement.CreateCourse.certificateTitlePlaceholder'
            )}
            type="text"
            isCompulsory={!is_external_certificate}
            name="course.certificate_title"
            isDisabled={isDisabled('certificate_title')}
            label={t('CoursesManagement.CreateCourse.certificateTitle')}
            isLoading={isMainLoading}
          />
          <ReactSelect
            parentClass="flex-[1_0_0%]"
            className="bg-white rounded-lg"
            selectedValue={certificateId}
            onChange={(val) => setCertificateId((val as Option).value as number)}
            placeholder={t(
              'CoursesManagement.CreateCourse.selectCertificatePlaceHolder'
            )}
            label={t('CoursesManagement.CreateCourse.certificate')}
            options={certificateOptions ?? []}
            disabled={isDisabled('certificate_template_id')}
            isCompulsory={!is_external_certificate}
            isLoading={isMainLoading}
          />
          <ReactSelect
            parentClass="flex-[1_0_0%]"
            className="bg-white rounded-lg"
            name="course.certificate_template_id"
            placeholder={t(
              'CoursesManagement.CreateCourse.selectCertificatePlaceHolder'
            )}
            label={t('CoursesManagement.CreateCourse.certificateVersions')}
            options={getMainCertificateOptions(certificateId) ?? []}
            disabled={isDisabled('certificate_template_id')}
            isCompulsory={!is_external_certificate}
            isLoading={isMainLoading}
          />
        </div>

        {/* ****************** CERTIFICATE TOPICS ****************** */}
        <p className="text-lg text-dark font-semibold mt-5">
          {`${t('CoursesManagement.CreateCourse.certificate')}  ${t(
            'CoursesManagement.CreateCourse.topics'
          )}`}
        </p>
        {(lessons ?? []).map((lesson, index) => {
          return (
            <div
              key={`${lesson.title}_${index + 1}`}
              className="flex flex-col gap-y-2 mt-5 border border-solid border-borderColor p-3 bg-white rounded-lg"
            >
              <FieldArray
                name={`lesson[${index}].topics`}
                render={(topicArrayHelpers) =>
                  renderTopics(lesson, topicArrayHelpers, index)
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CertificateInfo;
