import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import ReactSelect from 'components/FormElement/ReactSelect';
import Image from 'components/Image';
import { FieldArray, FieldArrayRenderProps, FormikValues } from 'formik';
import { EndScaling, getColorClass } from 'modules/Courses/Constants';
import { TFunctionProps } from 'modules/Courses/types';
import {
  SurveyQuestionProps,
  SurveyTypeSelectionProps,
} from 'modules/Courses/types/survey';

import { useTranslation } from 'react-i18next';

const handleAddOption = (arrayHelpers: FieldArrayRenderProps): void => {
  arrayHelpers.push({
    answer: '',
  });
};

const OptionTitle = (title: string) => {
  return <h4 className="text-dark font-semibold text-base mb-2.5">{title}</h4>;
};

const SurveyType = (
  { question_type, option, label }: SurveyQuestionProps,
  index: number,
  values: FormikValues,
  { t }: TFunctionProps,
  slugValue: string | undefined
) => {
  switch (question_type) {
    case 'mcq':
    case 'multiselect':
      return (
        <>
          {values.question[index].question_type === 'mcq'
            ? OptionTitle(t('CourseManagement.createSurvey.optionTitle'))
            : OptionTitle(t('CourseManagement.createSurvey.multipleOptionTitle'))}
          <div className="grid grid-cols-1 lg:grid-cols-2 1200:grid-cols-3 1600:grid-cols-4 gap-2">
            <FieldArray
              name={`question[${index}].option`}
              render={(optionArrayHelpers) => (
                <>
                  {option?.map((optionValue, opt_index: number) => {
                    return (
                      <div
                        key={`option_${opt_index + 1}`}
                        className="flex items-center w-full gap-2"
                      >
                        <InputField
                          placeholder={`${t(
                            'CourseManagement.createSurvey.optionPlaceholder'
                          )} ${opt_index + 1}`}
                          type="text"
                          value={optionValue.answer}
                          name={`question[${index}].option[${opt_index}].answer`}
                        />
                        {!slugValue &&
                          (values.question[index].option.length > 2 ||
                            opt_index < values.question[index].option.length - 2) ? (
                          <Button
                            className="button dangerBorder  w-10 h-10 !p-2 inline-block"
                            onClickHandler={() =>
                              optionArrayHelpers.remove(opt_index)
                            }
                          >
                            <Image iconName="deleteIcon" iconClassName="w-6 h-6" />
                          </Button>
                        ) : (
                          ''
                        )}

                        {!slugValue && opt_index === option.length - 1 ? (
                          <Button
                            onClickHandler={() =>
                              handleAddOption(optionArrayHelpers)
                            }
                            className="  w-10 h-10 !p-2 inline-block"
                            variants="primary"
                          >
                            <Image iconName="plusIcon" iconClassName="w-6 h-6" />
                          </Button>
                        ) : (
                          ''
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            />
          </div>
        </>
      );
    case 'scale':
      return (
        <div>
          {OptionTitle(t('CourseManagement.createSurvey.scaleTitle'))}
          <div className="grid grid-cols-1 1600:grid-cols-2 gap-4">
            <div className="flex gap-3 items-center max-w-[450px]">
              <InputField
                label={t('CourseManagement.createSurvey.startRange')}
                placeholder={t('CourseManagement.createSurvey.scaleRangeTitle')}
                parentClass=" flex-[1]"
                type="text"
                value={1}
                name={`question[${index}].scale1`}
                isDisabled
              />
              <span className="inline-block mt-6">
                {t('CourseManagement.createSurvey.toTitle')}
              </span>
              <ReactSelect
                placeholder={t('CourseManagement.createSurvey.scaleRangeTitle')}
                options={EndScaling}
                label={t('CourseManagement.createSurvey.endRange')}
                name={`question[${index}].range`}
                disabled={!!slugValue}
                parentClass=' flex-[1] [&_input[style]]:!w-0'
              />
            </div>
            <div className="w-fit 1600:ms-auto">
              <div className="flex justify-between">
                {Array.isArray(label) &&
                  label.length > 0 &&
                  label?.map((item, label_index) => {
                    return (
                      <div
                        className="flex items-center gap-1"
                        key={`label_${label_index + 1}`}
                      >
                        <InputField
                          type="text"
                          value={item.value}
                          name={`question[${index}].label[${label_index}].value`}
                          customStyle={{
                            width: `${item.value.length < 10
                              ? item.value.length * 10 + 20
                              : item.value.length * 10
                              }px`,
                          }}
                          className="!py-0.5 !px-1.5 !rounded"
                        />
                        <Button className="inline-block w-5 h-5">
                          <Image iconName="editPen" iconClassName="w-full h-full" />
                        </Button>
                      </div>
                    );
                  })}
              </div>
              <div className="flex gap-3 mt-2.5 flex-wrap md:flex-nowrap">
                {[...Array(values.question[index].range)].map((_, label_index) => {
                  const colorClass = getColorClass(
                    values.question[index].range,
                    label_index
                  );
                  return (
                    <div key={`label_${label_index + 1}`}>
                      <div
                        className={`${colorClass} w-9 h-7 text-sm font-medium text-white rounded items-center flex justify-center`}
                      >
                        {label_index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return '';
  }
};

const SurveyTypeSelection = ({
  questionData,
  index,
  values,
  slugValue,
}: SurveyTypeSelectionProps) => {
  const { t } = useTranslation();
  return (
    <div className="ms-auto md:max-w-[calc(100%_-_48px)] w-full mt-5">
      {!(
        questionData.question_type === 'answer' ||
        questionData.question_type === 'rate'
      ) && (
          <div className="md:bg-white md:rounded-xl  md:p-5  md:border  md:border-solid  md:border-borderColor">
            {SurveyType(questionData, index, values, { t }, slugValue)}
          </div>
        )}
    </div>
  );
};
export default SurveyTypeSelection;
