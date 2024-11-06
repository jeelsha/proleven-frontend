// ** Components **
import Button from 'components/Button/Button';
import ErrorMessage from 'components/FormElement/ErrorMessage';
import InputField from 'components/FormElement/InputField';
import ReactSelect from 'components/FormElement/ReactSelect';
import Image from 'components/Image';

// ** Types **
import { ICounterData } from 'components/CounterModal/types';
import { Option } from 'components/FormElement/types';
import { ICourseResource } from 'modules/Courses/types';
import { SetFieldValue } from 'types/common';

// ** hooks **
import { useAxiosGet } from 'hooks/useAxios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ** formik **
import { FieldArray, FieldArrayRenderProps } from 'formik';

// ** utils **
import _ from 'lodash';
import {
  checkResourcesAvailability,
  getRemainingResources,
} from 'modules/Courses/helper/ResourceHelper';
import { CourseBundleInterface } from 'modules/Courses/types/TemplateBundle';
import { shouldDisableField } from 'utils';

interface ResourceInfoProps {
  main_resources: Array<ICourseResource>;
  optional_resources: Array<ICourseResource>;
  fieldsToTranslate?: Array<string>;
  currentLanguage?: string;
  defaultLanguage?: string;
  setFieldValue?: SetFieldValue;
  isTemplate?: boolean;
  parentObjectName?: string;
  course_slug?: string | null;
  isOptionalRequired?: boolean;
  isLoading?: boolean;
  academy_id?: number | null;
  dates?: Array<string>;
  lessonTime?: Array<string>;
  timeSlots?: Array<string>;
  bundleValues?: CourseBundleInterface;
  setIsMainLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  isErrorRequired?: boolean;
}

const ResourcesInfo = ({
  main_resources,
  optional_resources,
  fieldsToTranslate,
  currentLanguage,
  defaultLanguage,
  setFieldValue,
  lessonTime,
  bundleValues,
  isTemplate = false,
  parentObjectName = 'course',
  course_slug,
  isOptionalRequired,
  isLoading = false,
  academy_id,
  dates,
  setIsMainLoading,
  timeSlots,
  isErrorRequired = true,
}: ResourceInfoProps) => {
  const { t } = useTranslation();

  // ** APIs
  const [getAvailableResources, { isLoading: isResourceLoading }] = useAxiosGet();

  // ** States
  const [resourceList, setResourceList] = useState<ICounterData[]>([]);

  // ** CONSTs
  const clonedResources = [...resourceList];
  const remainingMainResources = getRemainingResources(
    clonedResources,
    optional_resources
  );
  const remainingOptionalResources = getRemainingResources(
    clonedResources,
    main_resources
  );
  const allAssignedResources = [...main_resources, ...optional_resources]
    .filter((r) => r.resource_id)
    .map((r) => r.resource_id);
  const selectedDates = (dates ?? []).filter((i) => i).join(',');
  const apiUrl = isTemplate ? '/resources' : '/course/available/resources';
  const params = {
    view: true,
    ...(!isTemplate
      ? {
          ...(selectedDates ? { dates: selectedDates } : {}),
          ...(allAssignedResources?.length > 0
            ? {
                allAssignedResources: allAssignedResources.join(','),
              }
            : {}),
        }
      : {}),
    ...(lessonTime ? { timeSlot: lessonTime.toString() } : {}),
    ...(bundleValues
      ? { timeSlot: timeSlots?.filter((ts) => ts?.trim())?.toString() }
      : {}),
    ...(course_slug ? { course_slug } : {}),
  };

  const {
    isMainResourcesAvailable,
    isOptionalResourcesAvailable,
    combinedResourcesAvailable,
  } = checkResourcesAvailability(resourceList, main_resources, optional_resources);
  const isResourcesAvailable =
    isTemplate ||
    (isMainResourcesAvailable &&
      isOptionalResourcesAvailable &&
      combinedResourcesAvailable);

  const fetchAvailableResources = async () => {
    const { data } = await getAvailableResources(apiUrl, { params });
    if (Array.isArray(data?.data)) {
      setResourceList(data?.data);
    }
  };

  const handleAddResource = (
    arrayHelpers: FieldArrayRenderProps,
    resources: ICourseResource[]
  ): void => {
    if ((resources ?? []).length === 0) {
      arrayHelpers.push({ title: '', quantity: '', resource_id: '' });
      arrayHelpers.push({ title: '', quantity: '', resource_id: '' });
    } else arrayHelpers.push({ title: '', quantity: '', resource_id: '' });
  };

  const handleResourceChange = (
    val: Option,
    type: 'main' | 'optional',
    index: number,
    resources: ICourseResource[]
  ) => {
    setFieldValue?.(
      `${parentObjectName}.${type}_resources[${index}].title`,
      val?.label
    );
    setFieldValue?.(
      `${parentObjectName}.${type}_resources[${index}].resource_id`,
      val?.value
    );
    if (!resources?.[index]?.quantity) {
      setFieldValue?.(`${parentObjectName}.${type}_resources[${index}].quantity`, 1);
    } else {
      setFieldValue?.(
        `${parentObjectName}.${type}_resources[${index}].quantity`,
        Math.min(1, resources?.[index]?.quantity)
      );
    }
    if (!val?.label) {
      setFieldValue?.(
        `${parentObjectName}.${type}_resources[${index}].quantity`,
        ''
      );
    }
  };

  const handleQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    resources: ICourseResource[],
    type: 'main' | 'optional',
    remainingResources: ICounterData[]
  ) => {
    const inputValue = parseInt(e.target.value, 10);
    const maxQuantity =
      (remainingResources ?? []).find(
        (r) => r.id === resources?.[index]?.resource_id
      )?.quantity ?? 1;

    const newQuantity = Math.min(
      Math.max(!_.isNaN(inputValue) ? inputValue : 1),
      maxQuantity
    );
    setFieldValue?.(
      `${parentObjectName}.${type}_resources[${index}].quantity`,
      newQuantity
    );
  };

  const getResourceOptions = (
    remainingResources: ICounterData[],
    resources: ICourseResource[],
    index: number
  ): Option[] => {
    if (isResourcesAvailable) {
      return (remainingResources ?? [])
        .map((r) => ({
          value: r.id,
          label: `${r.title} - ${r.quantity}`,
        }))
        .filter((option) => {
          return resources.every((r) => {
            if (r.resource_id === resources?.[index]?.resource_id) return true;
            return r.resource_id !== option.value;
          });
        });
    }
    return (resources ?? [])
      .filter((r) => r.resource_id)
      .map((r) => ({
        label: `${r.title} - ${r.quantity}`,
        value: r.resource_id,
      }));
  };

  const renderResources = (
    index: number,
    arrayHelpers: FieldArrayRenderProps,
    resources: ICourseResource[],
    type: 'main' | 'optional',
    remainingResources: ICounterData[]
  ) => {
    return (
      <div className="flex flex-wrap gap-y-7 gap-x-4 w-full">
        <ReactSelect
          parentClass="flex-[1_0_0%]"
          className="bg-white rounded-lg"
          name={`${parentObjectName}.${type}_resources[${index}].resource_id`}
          options={getResourceOptions(remainingResources, resources, index)}
          onChange={(val) => {
            handleResourceChange(val as Option, type, index, resources);
          }}
          label={t('CoursesManagement.Resources.resource')}
          placeholder={t('CoursesManagement.CreateCourse.resourcesPlaceHolder')}
          disabled={
            !isResourcesAvailable ||
            isDisabled(`${type}_resources`) ||
            (!isTemplate && type === 'optional' && !isOptionalRequired)
          }
          isClearable={!academy_id || (type === 'optional' && !isOptionalRequired)}
          isLoading={isLoading || isResourceLoading}
        />

        <InputField
          parentClass="flex-[1_0_0%]"
          type="number"
          name={`${parentObjectName}.${type}_resources[${index}].quantity`}
          label={t('CoursesManagement.Resources.quantity')}
          placeholder="XXX"
          onChange={(e) =>
            handleQuantityChange(e, index, resources, type, remainingResources)
          }
          min={1}
          isDisabled={
            !resources?.[index]?.title ||
            isDisabled(`${type}_resources`) ||
            (!isTemplate && type === 'optional' && !isOptionalRequired)
          }
          isLoading={isLoading || isResourceLoading}
        />
        {(resources ?? []).length > 0 ? (
          <Button
            className="button dangerBorder mt-8 w-10 h-10 !p-2 inline-block"
            onClickHandler={() => arrayHelpers.remove(index)}
            disabled={
              isLoading ||
              isResourceLoading ||
              isDisabled('') ||
              (!isTemplate && type === 'optional' && !isOptionalRequired)
            }
          >
            <Image iconName="deleteIcon" iconClassName="w-6 h-6" />
          </Button>
        ) : (
          ''
        )}
      </div>
    );
  };

  const renderWarning = () => {
    return !isTemplate &&
      !isLoading &&
      !isResourceLoading &&
      resourceList?.length < 1 ? (
      <span className="text-sm font-medium mt-3 opacity-60">
        *{t('CoursesManagement.CreateCourse.resourcesWarning')}
      </span>
    ) : (
      ''
    );
  };

  const isDisabled = (val: string) =>
    shouldDisableField(
      val,
      fieldsToTranslate ?? [],
      currentLanguage ?? '',
      defaultLanguage ?? ''
    );

  // ** UseEffects
  useEffect(() => {
    if (isTemplate || (dates ?? []).filter(Boolean).length > 0) {
      fetchAvailableResources();
    }
  }, [dates, lessonTime, timeSlots]);

  useEffect(() => {
    if (isErrorRequired)
      setFieldValue?.(
        `${parentObjectName}.isErrorInResource`,
        !isResourcesAvailable
      );
  }, [isResourcesAvailable]);
  useEffect(() => {
    setIsMainLoading?.(isResourceLoading);
  }, [isResourceLoading]);

  return (
    <>
      {/* ************************************ MAIN RESOURCES ************************************ */}
      <div className="bg-primaryLight rounded-xl 1024:px-9 px-4 pb-8 pt-5">
        <FieldArray
          name={`${parentObjectName}.main_resources`}
          render={(arrayHelpers) => {
            return (
              <>
                <div className="flex justify-between">
                  <p className="text-base text-dark font-semibold">
                    {t('CourseBundle.trainer.selectMainResource')}
                  </p>
                  <Button
                    onClickHandler={() =>
                      handleAddResource(arrayHelpers, main_resources)
                    }
                    variants="primary"
                    className="w-10 h-10 !p-2 inline-block"
                    disabled={
                      isLoading ||
                      isResourceLoading ||
                      !remainingMainResources?.length ||
                      !isResourcesAvailable ||
                      isDisabled('')
                    }
                  >
                    <Image iconClassName="w-full h-full" iconName="plusIcon" />
                  </Button>
                </div>
                <div className="flex flex-col gap-y-4">
                  {(main_resources ?? []).length === 0
                    ? renderResources(
                        0,
                        arrayHelpers,
                        main_resources,
                        'main',
                        remainingMainResources
                      )
                    : (main_resources ?? []).map((resource, index) => (
                        <div key={`${resource.title}_${index + 1}`} className="">
                          {renderResources(
                            index,
                            arrayHelpers,
                            main_resources,
                            'main',
                            remainingMainResources
                          )}
                        </div>
                      ))}
                </div>
              </>
            );
          }}
        />

        {!isMainResourcesAvailable || !combinedResourcesAvailable ? (
          <ErrorMessage name={`${parentObjectName}.isErrorInResource`} />
        ) : (
          ''
        )}
        {renderWarning()}
      </div>
      {/* ************************************ MAIN RESOURCES ************************************ */}

      {/* ********************************** OPTIONAL RESOURCES ********************************** */}
      <div className="bg-primaryLight rounded-xl 1024:px-9 px-4 pb-8 pt-5">
        <FieldArray
          name={`${parentObjectName}.optional_resources`}
          render={(arrayHelpers) => {
            return (
              <>
                <div className="flex justify-between">
                  <p className="text-base text-dark font-semibold">
                    {t('CourseBundle.trainer.selectOptionalResource')}
                  </p>
                  <Button
                    onClickHandler={() =>
                      handleAddResource(arrayHelpers, optional_resources)
                    }
                    variants="primary"
                    className="w-10 h-10 !p-2 inline-block"
                    disabled={
                      isLoading ||
                      isResourceLoading ||
                      !remainingOptionalResources?.length ||
                      !isResourcesAvailable ||
                      isDisabled('') ||
                      (!isTemplate && !isOptionalRequired)
                    }
                  >
                    <Image iconClassName="w-full h-full" iconName="plusIcon" />
                  </Button>
                </div>
                <div className="flex flex-col gap-y-4">
                  {(optional_resources ?? []).length === 0
                    ? renderResources(
                        0,
                        arrayHelpers,
                        optional_resources,
                        'optional',
                        remainingOptionalResources
                      )
                    : (optional_resources ?? []).map((resource, index) => (
                        <div
                          key={`${resource.title}_${index + 1}`}
                          className="flex flex-col gap-y-2"
                        >
                          {renderResources(
                            index,
                            arrayHelpers,
                            optional_resources,
                            'optional',
                            remainingOptionalResources
                          )}
                        </div>
                      ))}
                </div>
              </>
            );
          }}
        />
        {!isOptionalResourcesAvailable || !combinedResourcesAvailable ? (
          <ErrorMessage name={`${parentObjectName}.isErrorInResource`} />
        ) : (
          ''
        )}
        {renderWarning()}
      </div>
      {/* ********************************** OPTIONAL RESOURCES ********************************** */}
    </>
  );
};

export default ResourcesInfo;
