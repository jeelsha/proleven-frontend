import { Form, Formik, FormikValues } from 'formik';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

// ** component **
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import Image from 'components/Image';
import SearchComponent from 'components/Table/search';

// ** utils **
import { customRandomNumberGenerator, useDebounce } from 'utils';

// ** hooks **
import { useAxiosGet, useAxiosPatch } from 'hooks/useAxios';

// ** type **
import { AttachQuoteProps, CompanyQuote, HandleCheckBoxQuotes } from '../types';

// ** redux slice **
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { setToast } from 'redux-toolkit/slices/toastSlice';

// ** style **
import '../style/index.css';

// ** constant **
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import NoDataFound from 'components/NoDataFound';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useModal } from 'hooks/useModal';
import { Link } from 'react-router-dom';

const AttachQuote = ({
  modal,
  card_id,
  company_id,
  quotes,
  CardModal,
  getProjectStages,
  isMove,
}: AttachQuoteProps) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const confirmPopUp = useModal();
  const user = useSelector(getCurrentUser);

  const [updateCardPatch, { isLoading: quoteAttachLoader }] = useAxiosPatch();
  const [getProjectCardDetail, { isLoading }] = useAxiosGet();

  const modalRef: React.RefObject<HTMLDivElement> = useRef(null);
  const firstRenderEffect = useRef(false);

  const formValue = {
    quoteCode: !_.isEmpty(quotes)
      ? quotes?.map((item) => String(item.quote_id))
      : ([] as string[]),
  };
  const [companyQuote, setCompanyQuote] = useState<CompanyQuote[]>([]);
  const [selectedCompany, setSelectedCompany] = useState(-1);
  const [singleCompanyQuote, setSingleCompanyQuote] = useState<
    CompanyQuote['Quotes']
  >([]);
  const [openAccordion, setOpenAccordion] = useState(false);
  const [search, setSearch] = useState('');

  const debounceSearch = useDebounce(search, 500);

  useEffect(() => {
    getQuotes();
  }, []);

  useEffect(() => {
    if (firstRenderEffect.current) getQuotes();
    firstRenderEffect.current = true;
  }, [debounceSearch]);

  const getQuotes = async () => {
    const objToPass: { [key: string]: unknown } = {
      view: true,
      quote_type: 'private',
    };
    if (search) {
      objToPass.search = debounceSearch;
      objToPass.searchFields = 'name';
    }
    if (!_.isEmpty(quotes)) {
      objToPass.company_id = company_id;
    }

    const apiCall = getProjectCardDetail('/quotes/company-wise', {
      params: objToPass,
    });
    const resp = await apiCall;
    if (resp?.data?.data.length > 0) {
      const tempObj = resp.data.data.map(
        ({ id, name, logo, Quotes }: CompanyQuote) => ({
          id,
          name,
          logo,
          Quotes,
        })
      );
      setCompanyQuote(tempObj);
    } else {
      setCompanyQuote(resp?.data?.data);
    }
  };

  const OnSubmit = async (userData: FormikValues) => {
    const companyIds: number[] = [];
    companyQuote.forEach((data) => {
      data.Quotes.forEach((companyQuote) => {
        userData.quoteCode.forEach((quote: string) => {
          if (quote === String(companyQuote.id))
            companyIds.push(companyQuote.company_id);
        });
      });
    });

    isMove.current = false;
    const resp = await updateCardPatch(`/cards/quote/${card_id}`, {
      quote_ids: userData.quoteCode,
    });
    // for(let i=0;i<userData.quoteCode.;i++)
    if (_.isEmpty(resp.error)) {
      modal.closeDropDown();
      CardModal.closeModal();
      getProjectStages();
      dispatch(
        setToast({
          variant: 'Success',
          message:
            userData.quoteCode.length > 0
              ? t('ToastMessage.quoteAssigned')
              : t('ToastMessage.quoteRemoved'),
          type: 'success',
          id: customRandomNumberGenerator(),
        })
      );
    }
  };

  const handleOnChangeCheckBox = (
    checkData: React.ChangeEvent<HTMLInputElement>,
    values: { quoteCode: string[] | undefined }
  ) => {
    const newData = String(checkData.target.value);
    const isChecked = checkData.target.checked;
    const newSelected: string[] = values && [...(values.quoteCode as string[])];
    if (isChecked) {
      newSelected.push(newData);
    } else {
      newSelected.splice(newSelected.indexOf(newData), 1);
      // setSelectedQuotes(selectedQuotes);
    }
    return newSelected;
  };

  const handleCheckBoxChange = ({
    checkData,
    values,
    setFieldValue,
  }: HandleCheckBoxQuotes) => {
    if (
      user &&
      (user.role_name === ROLES.TrainingSpecialist ||
        user.role_name === ROLES.Admin ||
        user.role_name === ROLES.SalesRep)
    ) {
      const newCheckValue = handleOnChangeCheckBox(checkData, values);
      setFieldValue('quoteCode', newCheckValue);
    } else {
      checkData.preventDefault();
      dispatch(
        setToast({
          variant: 'Warning',
          message: `${t('ToastMessage.quoteRemoveText')}`,
          type: 'warning',
          id: customRandomNumberGenerator(),
        })
      );
    }
  };

  const renderData = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center mt-2">
          <Image loaderType="Spin" />
        </div>
      );
    }
    if (_.isEmpty(companyQuote) && !isLoading) {
      return <NoDataFound />;
    }
  };

  const renderElement = () => {
    return (
      <div className="mt-2">
        <Formik initialValues={formValue} onSubmit={(value) => OnSubmit(value)}>
          {({ values, setFieldValue }) => {
            return (
              <Form>
                <div className="flex mb-5 max-h-[calc(100dvh_-_65dvh)] overflow-auto">
                  <div className="flex-[1_0_0%]">
                    {/* Company List */}

                    {renderData() ||
                      companyQuote.map((item) => {
                        return (
                          <>
                            <div
                              key={item.id}
                              onClick={() => {
                                setSelectedCompany(item.id);
                                setSingleCompanyQuote(item.Quotes);
                                setOpenAccordion(!openAccordion);
                              }}
                              className={`flex items-center cursor-pointer ps-5 pe-2 py-1.5 border-b border-solid border-borderColor ${
                                item.id === selectedCompany ? 'border-none' : ''
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full">
                                <Image
                                  width={32}
                                  height={32}
                                  imgClassName="w-full h-full object-cover rounded-full"
                                  src={item.logo}
                                  serverPath
                                />
                              </div>
                              <p className="max-w-[calc(100%_-_32px)] px-2 truncate text-sm text-dark">
                                {item.name}
                              </p>
                              <Image
                                iconName="chevronRight"
                                iconClassName={`w-3.5 h-3.5 ms-auto ${
                                  item.id === selectedCompany ? 'rotate-90' : ''
                                }`}
                              />
                            </div>
                            {!_.isEmpty(singleCompanyQuote) &&
                              item.id === selectedCompany &&
                              openAccordion && (
                                <div className="w-full flex flex-col pb-2 border-b border-solid border-borderColor">
                                  {singleCompanyQuote.map((quote) => {
                                    const isCheckboxChecked =
                                      values.quoteCode && quote?.id
                                        ? values?.quoteCode?.indexOf(
                                            String(quote.id)
                                          ) > -1
                                        : false;
                                    return (
                                      <div
                                        key={quote.id}
                                        className="flex align-middle items-center"
                                      >
                                        <Checkbox
                                          parentClass="py-2 px-6"
                                          name="quoteCode"
                                          check={isCheckboxChecked}
                                          value={String(quote.id)}
                                          onChange={(checkData) => {
                                            handleCheckBoxChange({
                                              checkData,
                                              values,
                                              setFieldValue,
                                            });
                                          }}
                                          // text={quote.quote_number}
                                        />
                                        <Link
                                          to={`${PRIVATE_NAVIGATION.quotes.list.path}/view/${quote?.slug}`}
                                          target="_blank"
                                        >
                                          <span className="hover:underline decoration-blue">
                                            {quote.quote_number}
                                          </span>
                                        </Link>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                          </>
                        );
                      })}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-x-4">
                  <Button
                    onClickHandler={() => modal.closeDropDown()}
                    variants="whiteBordered"
                    className="min-w-[140px]"
                  >
                    {t('Button.cancelButton')}
                  </Button>
                  <div className="relative inline-block group">
                    <Button
                      onClickHandler={() => {
                        confirmPopUp.openModal();
                      }}
                      variants="primary"
                      className="min-w-[140px]"
                    >
                      {t('ProjectManagement.CustomCardModal.Button.apply')}
                    </Button>
                  </div>
                  {confirmPopUp.isOpen && (
                    <ConfirmationPopup
                      modal={confirmPopUp}
                      bodyText={t(
                        'ProjectManagement.CustomCardModal.confirmAttachQuote.message'
                      )}
                      variants="secondary"
                      popUpType="success"
                      deleteTitle={t(
                        'ProjectManagement.CustomCardModal.confirmAttachQuote.title'
                      )}
                      confirmButtonText={t(
                        'ProjectManagement.CustomCardModal.Button.apply'
                      )}
                      confirmButtonFunction={() => OnSubmit(values)}
                      confirmButtonVariant="secondary"
                      isLoading={quoteAttachLoader}
                      cancelButtonText={t('Button.cancelButton')}
                      cancelButtonFunction={() => {
                        confirmPopUp.closeModal();
                      }}
                    />
                  )}
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    );
  };

  return (
    <div className="absolute bottom-0 right-[calc(100%_+_7px)]" ref={modalRef}>
      <div className="w-[550px] bg-white rounded-lg shadow-lg shadow-black/20 border">
        <div className="inside-list-modal-title">
          <p className="text-base font-semibold leading-5 text-dark">
            {t('ProjectManagement.CustomCardModal.modalTitle.quote')}
          </p>
        </div>
        <div className="p-5 rounded-b-lg">
          <SearchComponent
            placeholder={t(
              'ProjectManagement.CustomCardModal.modalTitle.quoteSearchPlaceHolder'
            )}
            onSearch={(e) => {
              setSearch(e.target.value);
            }}
            parentClass="min-w-[100%]"
            onClear={() => {
              setSearch('');
            }}
            value={search}
          />
          {renderElement()}
        </div>
      </div>
    </div>
  );
};

export default AttachQuote;
