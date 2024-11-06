import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import InputField from 'components/FormElement/InputField';
import Image from 'components/Image';
import { FieldArray, Form, Formik, FormikValues } from 'formik';
import { useAxiosPut } from 'hooks/useAxios';
import { TFunction } from 'i18next';

const AddDescription = ({
  t,
  slug,
  descriptionData = [],
}: {
  t: TFunction<'translation', undefined>;
  slug: string | undefined;
  descriptionData?: string[];
}) => {
  const [orderUpdateApi, { isLoading }] = useAxiosPut();
  const initialValues = {
    description:
      typeof descriptionData === 'string'
        ? JSON.parse(descriptionData)
        : descriptionData ?? [''],
  };
  const OnSubmit = async (values: FormikValues) => {
    const updatedData = {
      slug,
      description: values.description,
    };
    await orderUpdateApi(
      `/order/update/description
    `,
      updatedData
    );
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={(values) => OnSubmit(values)}
    >
      {({ values, errors }) => (
        <Form className="grid lg:grid-cols-1 gap-4">
          <CustomCard minimal>
            <>
              <p className="text-3xl font-semibold mb-4">
                {t('Quote.company.product.fundedByDescriptionTitle')}
              </p>
              <div className="grid gap-4">
                <FieldArray
                  name="description"
                  render={(arrayHelpers) =>
                    values.description.map((description: string, index: number) => (
                      <div
                        key={`description_${index + 1}`}
                        className="flex items-start w-full gap-3"
                      >
                        <InputField
                          placeholder={t('Codes.descriptionPlaceHolder')}
                          type="text"
                          value={description}
                          label={
                            index === 0
                              ? t('EmailTemplate.emailTempTableDescription')
                              : ''
                          }
                          name={`description.${index}`}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            arrayHelpers.replace(index, newValue);
                          }}
                        />
                        <div
                          className={`flex items-center gap-2 mt-0 ${errors.description ? '' : ''
                            } ${index === 0 ? 'mt-[29px]' : ''}`}
                        >
                          {index === values.description.length - 1 && (
                            <Button
                              onClickHandler={() => arrayHelpers.push('')}
                              className="addIconCard min-w-[47px] min-h-[47px]"
                            >
                              <Image iconName="plusIcon" />
                            </Button>
                          )}
                          {values.description.length > 1 && (
                            <Button
                              className="button dangerBorder min-w-[47px] min-h-[47px] !p-2 inline-block"
                              onClickHandler={() => arrayHelpers.remove(index)}
                            >
                              <Image iconName="deleteIcon" iconClassName="w-6 h-6" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  }
                />
              </div>
              <Button
                className="min-w-[90px] mt-4"
                variants="primary"
                type="submit"
                isLoading={isLoading}
              >
                {t('Button.saveButton')}
              </Button>
            </>
          </CustomCard>
        </Form>
      )}
    </Formik>
  );
};

export default AddDescription;
