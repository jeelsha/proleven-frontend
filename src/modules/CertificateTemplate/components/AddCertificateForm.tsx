// ** libraries **
import { Form, Formik, FormikValues } from 'formik';

// ** validations **
import InputField from 'components/FormElement/InputField';
import { CertificateTemplateValidation } from 'modules/CertificateTemplate/validation';

// ** components **
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Checkbox from 'components/FormElement/CheckBox';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import ReactEditor from 'components/ReactQuillEditor/ReactQuillEditor';

// ** hooks **
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

// ** redux **
import { useDispatch, useSelector } from 'react-redux';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { setToast } from 'redux-toolkit/slices/toastSlice';

// ** types **
import { InitialValues } from 'modules/CertificateTemplate/types';
import { EmailNotes } from 'modules/EmailTemplate/types';

// ** utils **
import { sortLanguages } from 'modules/Courses/helper/CourseTemplateHelper';
import { SetFieldValue } from 'types/common';
import {
  capitalizeFirstCharacter,
  customRandomNumberGenerator,
  findBraces,
  replaceBracesWithTemplateTags,
  replaceTemplateTagsWithBraces,
} from 'utils';
// import { REACT_APP_API_BASE_URL } from 'config';

const AddCertificateModal = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const [createCertificate, { isLoading }] = useAxiosPost();
  const [getAllTemplate] = useAxiosGet();
  const activeLanguage = useSelector(useLanguage);

  const sortedLanguages = [...(activeLanguage?.allLanguages ?? [])].sort(
    sortLanguages
  );
  const [currentCertificate, setCurrentCertificate] = useState<{
    [key: string]: string;
  } | null>(null);
  const [allLanguages, setAllLanguages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (sortedLanguages) {
      const returnActiveLanguages = sortedLanguages?.reduce(
        (acc, item) => ({
          ...acc,
          [item.short_name]: item.name,
        }),
        {}
      );

      setAllLanguages(returnActiveLanguages);
    }
  }, [activeLanguage?.allLanguages]);

  const fetchCategory = async () => {
    const response = await getAllTemplate(`/certificate-templates`, {
      params: {
        allLanguage: true,
        simplifyResponseByLanguage: true,
        certificate_template_id: state?.id ?? null,
        latest: true,
      },
    });
    const category = response?.data;
    if (category) setCurrentCertificate(category[0]);
  };

  useEffect(() => {
    fetchCategory();
  }, []);
  const initialValues: InitialValues = {};

  const fieldObject: {
    title: string;
    content: string;
    key: string;
    is_legislation_included: string;
    label: string;
    note: string;
  }[] = [];

  Object.values(allLanguages).forEach((lang) => {
    // ** Adding name attribute for all other optional languages
    fieldObject.push({
      key: lang,
      title: `title_${lang}`,
      content: `content_${lang}`,
      is_legislation_included: `is_legislation_included_${lang}`,
      note: `note_${lang}`,
      label: lang.charAt(0).toUpperCase() + lang.slice(1),
    });
    // ** adding all languages field to initialValue object

    let certificateTemplateId = null;

    if (currentCertificate) {
      if (!state?.isAdd) {
        certificateTemplateId = currentCertificate[`certificate_template_id_${lang}`]
          ? currentCertificate[`certificate_template_id_${lang}`]
          : currentCertificate[`id_${lang}`];
      }
    }

    initialValues[`title_${lang}`] = currentCertificate
      ? currentCertificate[`title_${lang}`]
      : '';
    initialValues[`note_${lang}`] = currentCertificate
      ? currentCertificate[`note_${lang}`]
      : '';
    initialValues[`content_${lang}`] = currentCertificate
      ? replaceTemplateTagsWithBraces(currentCertificate[`content_${lang}`])
      : '';
    initialValues.is_legislation_included = currentCertificate
      ? currentCertificate[`is_legislation_included_${lang}`]
      : false;

    initialValues[`certificate_template_id_${lang}`] = certificateTemplateId;
  });
  const handleChange = (values: InitialValues, setFieldValue: SetFieldValue) => {
    setFieldValue('is_legislation_included', !values.is_legislation_included);
    fieldObject.forEach((item) => {
      setFieldValue(item.is_legislation_included, !values.is_legislation_included);
    });
  };

  const containsZero = (array: { [key: string]: number }[]) => {
    return array.some((obj) => Object.values(obj).includes(0));
  };
  let tempArray: { [key: string]: number }[] = [];

  const OnSubmit = async (certificateData: FormikValues) => {
    delete certificateData?.is_legislation_included;
    let noKeyFlag = false;
    Object.values(allLanguages).forEach(async (lang) => {
      const keyFind =
        currentCertificate?.[`note_${lang}`] &&
        JSON.parse(currentCertificate[`note_${lang}`] as unknown as string).map(
          (obj: { [key: string]: string }) => Object.keys(obj)[0]
        );
      const { braceCounts } = findBraces(
        certificateData[`content_${lang}`],
        keyFind
      );
      tempArray.push(braceCounts);
    });
    if (!containsZero(tempArray)) {
      const certificatePayload = { ...certificateData };
      const formData = new FormData();

      Object.entries(certificatePayload).forEach(([key, value]) => {
        let shouldAppend = false;

        Object.values(allLanguages).forEach((lang) => {
          if (key === `content_${lang}`) {
            shouldAppend = true;
          }
        });

        if (shouldAppend) {
          Object.values(allLanguages).forEach((lang) => {
            if (key === `content_${lang}`) {
              formData.append(
                `content_${lang}`,
                replaceBracesWithTemplateTags(certificateData[`content_${lang}`])
              );
            }
          });
        } else {
          formData.append(key, value);
        }
      });

      const { error } = await createCertificate('/certificate-templates', formData);
      if (!error) {
        if (!state?.id) {
          navigate('/certificate-template');
        } else {
          navigate(`/certificate-template/version/${state?.slug}`, {
            state: {
              data: { id: state?.id, title: state?.title, slug: state?.slug },
            },
          });
        }
        tempArray = [];
      }
    } else {
      noKeyFlag = true;
      if (noKeyFlag) {
        dispatch(
          setToast({
            variant: 'Error',
            message: `${t('ToastMessage.emailTemplateNotes')}`,
            type: 'error',
            id: customRandomNumberGenerator(),
          })
        );
        tempArray = [];
      }
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values) => OnSubmit(values)}
      enableReinitialize
      validationSchema={CertificateTemplateValidation()}
    >
      {({ values, setFieldValue, setFieldTouched }) => {
        return (
          <>
            <PageHeader
              text={t('certificate.add')}
              small
              url={
                !state?.id
                  ? `/certificate-template`
                  : `/certificate-template/version/${state?.slug}`
              }
              passState={{
                data: { id: state?.id, title: state?.title, slug: state?.slug },
              }}
            />

            <CustomCard>
              <Form>
                <div className=" flex flex-col gap-4 ">
                  {fieldObject.map((language, index) => {
                    // const updatedContent = values[language.content]?.toString().replace(
                    //   "[process.env.SERVER_URL]",
                    //   `${REACT_APP_API_BASE_URL}`
                    // );
                    return (
                      <div
                        className="bg-[#FBFBFC]  border border-borderColor rounded-xl px-4 py-5 "
                        key={`lang_${index + 1}`}
                      >
                        <p className="text-lg leading-6 font-bold pb-2">
                          {language?.label}
                        </p>
                        <div>
                          <div>
                            <InputField
                              key={`${language.key}_title`}
                              isCompulsory
                              placeholder={t(
                                'CoursesManagement.CreateCourse.namePlaceHolder'
                              )}
                              type="text"
                              value={values[language.title]?.toString()}
                              label={t('certificate.temp')}
                              name={language.title}
                            />
                          </div>
                        </div>
                        <div
                          className="mt-4 col-span-2"
                          key={`${language.key}_content`}
                        >
                          <ReactEditor
                            label={t('certificate.content')}
                            isCompulsory
                            parentClass="h-unset bg-white"
                            name={language.content}
                            setFieldValue={setFieldValue}
                            setFieldTouched={setFieldTouched}
                            value={values[language.content]?.toString() ?? ''}
                          // value={updatedContent ?? ''}
                          // id={`${language.content}_editor`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className=" mt-4 flex gap-4 justify-between items-end ">
                  <div className=" ">
                    <Checkbox
                      id="is_legislation_included"
                      name="is_legislation_included"
                      onChange={() => handleChange(values, setFieldValue)}
                      check={!!values.is_legislation_included}
                      text={t('certificate.legReq')}
                    />
                    {currentCertificate && (
                      <div>
                        <p className="my-4 font-medium">{t('SendMail.Notes')}</p>

                        {currentCertificate.note_english &&
                          JSON.parse(
                            currentCertificate.note_english as unknown as string
                          ).map((item: EmailNotes) => {
                            return Object.entries(item).map(
                              ([key, value]: [string, string], index: number) => {
                                return (
                                  <div
                                    key={`note_${index + 1}`}
                                    className="flex gap-1 items-center"
                                  >
                                    <Image
                                      iconName="checkRoundIcon2"
                                      iconClassName="w-4 h-4 text-grayText"
                                    />
                                    <Button className="text-dark">
                                      {`${capitalizeFirstCharacter(key)}: ${value}`}
                                    </Button>
                                  </div>
                                );
                              }
                            );
                          })}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-4 mt-4">
                    <Button
                      className="min-w-[90px]"
                      variants="whiteBordered"
                      onClickHandler={() => {
                        navigate(-1);
                      }}
                    >
                      {t('Button.cancelButton')}
                    </Button>
                    <Button
                      isLoading={isLoading}
                      disabled={isLoading}
                      variants="primary"
                      type="submit"
                      className="addButton min-w-[90px]"
                      name="next"
                    >
                      {t('Button.saveButton')}
                    </Button>
                  </div>
                </div>
              </Form>
            </CustomCard>
          </>
        );
      }}
    </Formik>
  );
};
export default AddCertificateModal;
