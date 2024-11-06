import Button from 'components/Button/Button';
import DownloadFileModal from 'components/DownloadPdfModel/DownloadFile';
import Image from 'components/Image';
import PageHeader from 'components/PageHeader/PageHeader';
import StatusLabel from 'components/StatusLabel';
import { REACT_APP_API_BASE_URL } from 'config';
import { ROLES } from 'constants/roleAndPermission.constant';
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useTitle } from 'hooks/useTitle';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { CourseDetails } from '../../Order/components/CourseDetails';
import { ProductDetails } from '../../Order/components/ProductDetails';
import { QuoteData } from '../../Order/components/QuoteData';
import {
  CompanyDataProps,
  CourseDataInvoiceProps,
  OrderProps,
  ProductDataProps,
  QuoteDataProps,
} from '../../Order/types';

export const ViewInvoice = () => {
  const url = new URL(window.location.href);
  const params = useParams();
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('invoiceDetailsTitle'));

  const [orderDetails, setOrderDetails] = useState<OrderProps>();
  const [getOrderApi, { isLoading }] = useAxiosGet();
  const [generatePdf, { isLoading: pdfDownloading }] = useAxiosPost();
  const user = useSelector(getCurrentUser);
  const navigate = useNavigate();

  const downloadModal = useModal();
  const getOrderData = async () => {
    const response = await getOrderApi(`/invoice`, {
      params: { slug: params?.slug, type: 'invoice' },
    });
    setOrderDetails(response.data);
  };

  useEffect(() => {
    getOrderData();
  }, []);

  const statusRender = (item: string) => {
    const getStatusClass = () => {
      switch (item) {
        case 'Sent':
          return 'completed';
        case 'Paid':
          return 'primary';
        case 'Overdue':
          return 'cancelled';
        default:
          return 'primary';
      }
    };

    const statusClasses = ` ${getStatusClass()}`;

    return (
      <StatusLabel
        text={item}
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    );
  };

  const DownloadPdf = async (data: string) => {
    const response = await generatePdf(`invoice/pdf/${orderDetails?.slug}`, {
      language: data,
      type: 'invoice',
    });
    if (response.data) {
      const extractedPath = response.data.invoiceFilePath;
      window.open(`${REACT_APP_API_BASE_URL}/${extractedPath}`, '_blank');
      downloadModal?.closeModal();
    }
  };

  const invoiceDownload = () => {
    return (
      <div className="flex gap-2">
        {user?.role_name !== ROLES.TrainingSpecialist && (
          <>
            {orderDetails && (
              <Button
                parentClass="h-fit"
                className="action-button green-btn"
                onClickHandler={() => {
                  navigate(`/credit-notes/${orderDetails.slug}`);
                }}
                tooltipText={t('Tooltip.CreditNotes')}
              >
                <Image
                  iconName="bookmarkIcon2"
                  iconClassName=" w-5 h-5"
                  width={24}
                  height={24}
                />
              </Button>
            )}
            <Button
              parentClass="h-fit"
              className="action-button primary-btn"
              onClickHandler={() => {
                downloadModal?.openModal();
              }}
              tooltipText={t('Tooltip.DownloadPDF')}
            >
              <Image
                iconName="downloadFile2"
                iconClassName="stroke-current w-5 h-5"
              />
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <PageHeader
        small
        text={t('invoiceDetailsTitle')}
        url={
          url.searchParams.has('isInvoice') ? `/invoice${url.search}` : '/invoice'
        }
      >
        {invoiceDownload()}
      </PageHeader>
      {isLoading ? (
        <div className="flex justify-center">
          <Image loaderType="Spin" />
        </div>
      ) : (
        <>
          <QuoteData
            quoteData={orderDetails?.quotes as unknown as QuoteDataProps}
            companyData={orderDetails?.company as unknown as CompanyDataProps}
            order_number={orderDetails?.order_number as unknown as string}
            invoice_number={orderDetails?.invoice_number as unknown as string}
            invoiceDate={orderDetails?.invoice_date as unknown as Date}
            t={t}
            statusRenderData={statusRender(orderDetails?.payment_status as string)}
          />
          {orderDetails?.quotes ? (
            <ProductDetails
              productData={
                orderDetails?.quotes?.quoteProduct as unknown as ProductDataProps
              }
              quoteData={orderDetails?.quotes as unknown as QuoteDataProps}
              checkData={false}
              t={t}
            />
          ) : (
            <CourseDetails
              t={t}
              courseData={orderDetails?.course as unknown as CourseDataInvoiceProps}
            />
          )}
        </>
      )}
      {downloadModal?.isOpen && (
        <DownloadFileModal
          modal={downloadModal}
          handleAccept={(data) => DownloadPdf(data)}
          disabled={pdfDownloading}
        />
      )}

      {/* <div className="mt-30px flex flex-wrap -mx-2.5">
        <div className="w-1/2 px-2.5">
          <CustomCard
            minimal
            title={t('ProjectManagement.CustomCardModal.commentLabel')}
            cardClass="h-full"
          >
            <div className=" border-t border-solid border-borderColor pt-5 ">
              {!_.isEmpty(orderDetails?.order_comment) &&
                orderDetails?.order_comment && (
                  <div className="bg-siteBG p-5 rounded-lg mb-5 flex flex-col gap-y-5 max-h-[378px] overflow-auto">
                    <OrderCommentDisplay
                      orderCommentList={orderDetails?.order_comment}
                      CurrentUser={CurrentUser}
                      storeLang={storeLang}
                      t={t}
                    />
                  </div>
                )}
              <OrderComment
                orderId={orderDetails?.id}
                t={t}
                getOrderData={getOrderData}
              />
            </div>
          </CustomCard>
        </div>
        <div className="w-1/2 px-2.5">
          <CustomCard
            minimal
            cardClass="h-full"
            title={t('Auth.RegisterTrainer.trainerAttachment')}
          >
            <div className=" border-t border-solid border-borderColor pt-5 ">
              <OrderAttachments
                orderId={orderDetails?.id}
                t={t}
                orderAttachments={orderDetails?.order_attachment}
              />
            </div>
          </CustomCard>
        </div>
      </div> */}
      {/* <div className="mt-30px">
        <ClientPurchaseOrder
          purchaseOrder={orderDetails?.purchase_reminder_date as unknown as Date}
          orderId={orderDetails?.id}
          t={t}
          getOrderData={getOrderData}
          clientPurchaseOrder={orderDetails?.client_purchase_order}
          paymentTermId={orderDetails?.company?.payment_term_id}
        />
      </div>
      {orderDetails?.quotes && orderDetails?.quotes?.funded_by !== null && (
        <div className="mt-30px">
          <AddDescription
            t={t}
            slug={params?.slug}
            descriptionData={orderDetails?.description}
          />
        </div>
      )} */}
    </>
  );
};
