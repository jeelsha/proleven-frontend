// ** imports **
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// ** components **
import Button from 'components/Button/Button';
import ReactSelect from 'components/FormElement/ReactSelect';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';

// ** constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';

// ** hooks **
import { useQueryGetFunction } from 'hooks/useQuery';

// ** types **
import { QuoteModalInitialProps } from 'modules/Quotes/types';

// ** validation **
import { CompanyValidationSchema } from 'modules/Quotes/validation';

// ** redux **
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';

interface InitialProps {
  company_id: string;
}

const initialValue = {
  company_id: '',
  selectedOption: 'existingClient',
};

export const CreateQuoteModal = ({ modal, quoteSlug }: QuoteModalInitialProps) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState('existingClient');
  const navigate = useNavigate();
  const allRoles = useSelector(getRoles);
  const currentRole = allRoles.find((role) => role.name === ROLES.Company);

  const { response, isLoading } = useQueryGetFunction(`/companies`, {
    option: {
      dropdown: true,
      label: 'name',
      value: 'slug',
    },
    role: currentRole?.id.toString(),
  });

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };
  const handleNext = (values: InitialProps) => {
    if (selectedOption === 'newClient') {
      navigate(PRIVATE_NAVIGATION.clientsManagement.company.list.path, {
        state: { isAddForm: true },
      });
    }
    if (selectedOption === 'existingClient') {
      const url = quoteSlug
        ? `${PRIVATE_NAVIGATION.quotes.list.path}/clone/${values.company_id}/${quoteSlug}`
        : `${PRIVATE_NAVIGATION.quotes.list.path}/${values.company_id}/add`;
      navigate(url);
    }
  };
  return (
    <Modal modal={modal} headerTitle={t('Quote.company.createQuoteTitle')}>
      <Formik
        enableReinitialize
        initialValues={initialValue}
        validationSchema={CompanyValidationSchema()}
        onSubmit={(values: InitialProps) => handleNext(values)}
      >
        {({ setFieldValue }) => (
          <Form>
            <div className="">
              <div className="max-w-[623px] mx-auto grid grid-cols-2 gap-5 mb-16">
                <div className="h-[213px]">
                  <div
                    className={`bg-authBG/30 p-5  text-primary rounded-xl h-full flex items-center flex-col justify-center transition-all duration-300 ${
                      selectedOption === 'existingClient'
                        ? ' bg-primary text-white'
                        : ' text-dark'
                    }`}
                  >
                    <label
                      htmlFor="existingClient"
                      className="flex items-center flex-col justify-center"
                    >
                      <Image
                        iconName="drawPadIcon"
                        iconClassName="w-[70px] h-[70px]"
                      />
                      <p className="text-current text-xl font-semibold mb-5 mt-2.5 text-center leading-[1.2]">
                        {t('Quote.company.existingCompanyTitle')}
                      </p>
                    </label>
                    <span
                      className={`cursor-pointer inline-flex items-center justify-center relative w-5 h-5 border-2 border-solid border-grayText rounded  ${
                        selectedOption === 'existingClient'
                          ? ' bg-primary2 border-primary2'
                          : ''
                      }`}
                    >
                      {selectedOption === 'existingClient' && (
                        <span className="absolute bottom-1 w-1.5 h-2.5 border-b-2 border-r-2 border-solid border-dark inline-block rotate-45" />
                      )}
                      <input
                        type="radio"
                        className="appearance-none cursor-pointer opacity-0 w-full h-full"
                        id="existingClient"
                        name="clientOption"
                        checked={selectedOption === 'existingClient'}
                        onChange={() => {
                          handleOptionChange('existingClient');
                          setFieldValue('selectedOption', 'existingClient');
                        }}
                      />
                    </span>
                  </div>
                </div>
                <div className="h-[213px]">
                  <div
                    className={`bg-authBG/30 p-5  text-primary rounded-xl h-full flex items-center flex-col justify-center transition-all duration-300 ${
                      selectedOption === 'newClient'
                        ? ' bg-primary text-white'
                        : ' text-dark'
                    }`}
                  >
                    <label
                      htmlFor="newClient"
                      className="flex items-center flex-col justify-center"
                    >
                      <Image
                        iconName="templateIcon"
                        iconClassName="w-[70px] h-[70px]"
                      />
                      <p className="text-current text-xl font-semibold mb-5 mt-2.5 text-center leading-[1.2]">
                        {t('Quote.company.newCompanyTitle')}
                      </p>
                    </label>
                    <span
                      className={`cursor-pointer inline-flex items-center justify-center relative w-5 h-5 border-2 border-solid border-grayText rounded  ${
                        selectedOption === 'newClient'
                          ? ' bg-primary2 border-primary2'
                          : ''
                      }`}
                    >
                      {selectedOption === 'newClient' && (
                        <span className="absolute bottom-1 w-1.5 h-2.5 border-b-2 border-r-2 border-solid border-dark inline-block rotate-45" />
                      )}
                      <input
                        type="radio"
                        className="appearance-none cursor-pointer opacity-0 w-full h-full"
                        id="newClient"
                        name="clientOption"
                        checked={selectedOption === 'newClient'}
                        onChange={() => {
                          handleOptionChange('newClient');
                          setFieldValue('selectedOption', 'newClient');
                        }}
                      />
                    </span>
                  </div>
                </div>
                {selectedOption === 'existingClient' &&
                  response?.data?.length > 0 && (
                    <ReactSelect
                      parentClass="col-span-2"
                      className="w-full"
                      name="company_id"
                      isCompulsory
                      options={response?.data}
                      label={t('Quote.company.title')}
                      placeholder={t('Quote.company.companyPlaceholder')}
                      isLoading={isLoading}
                    />
                  )}
              </div>
              <Button
                variants="primary"
                className="w-fit mx-auto gap-2"
                type="submit"
              >
                {t('Quote.company.nextTitle')}
                <Image iconName="arrowRightIcon" iconClassName="w-4 h-4" />
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
