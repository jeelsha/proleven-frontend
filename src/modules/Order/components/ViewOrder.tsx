import CustomCard from 'components/Card';
import PageHeader from 'components/PageHeader/PageHeader';
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';

import Button from 'components/Button/Button';
import DownloadFileModal from 'components/DownloadPdfModel/DownloadFile';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import { REACT_APP_API_BASE_URL, REACT_APP_DATE_FORMAT } from 'config';
import { FeaturesEnum, PermissionEnum } from 'constants/common.constant';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { format } from 'date-fns';
import { useModal } from 'hooks/useModal';
import { useRolePermission } from 'hooks/useRolePermission';
import { useTitle } from 'hooks/useTitle';
import { OrderStatusType } from 'modules/CreditNotes/types';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import {
  CompanyDataProps,
  CourseDataInvoiceProps,
  OrderProps,
  ProductDataProps,
  QuoteDataProps,
} from '../types';
import AddDescription from './AddDescription';
import { CourseDetails } from './CourseDetails';
import OrderAttachments from './OrderAttachments';
import OrderComment from './OrderComment';
import OrderCommentDisplay from './OrderCommentDisplay';
import { ProductDetails } from './ProductDetails';
import ClientPurchaseOrder from './PurchaseOrder';
import PurchaseOrderReminderModal from './PurchaseOrderReminderModal';
import { QuoteData } from './QuoteData';

export const ViewOrder = () => {
  const url = new URL(window.location.href);
  const params = useParams();
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('orderDetailsTitle'));
  const editAccess = useRolePermission(FeaturesEnum.Quote, PermissionEnum.Update);
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderProps>();
  const [getOrderApi, { isLoading }] = useAxiosGet();
  const [generatePdf, { isLoading: pdfDownloading }] = useAxiosGet();
  const CurrentUser = useSelector(getCurrentUser);
  const [sendReminder] = useAxiosPost();
  const reminderDateModal = useModal();
  const downloadModal = useModal();

  const storeLang = useSelector(useLanguage);
  const getOrderData = async () => {
    const response = await getOrderApi(`/order`, { params: { slug: params?.slug } });
    setOrderDetails(response.data);
  };

  useEffect(() => {
    getOrderData();
  }, []);

  const statusRender = (item: string) => {
    const getStatusClass = () => {
      switch (item) {
        case 'Open':
          return 'completed';
        case 'Partially Closed':
          return 'primary';
        case 'Closed':
          return 'cancelled';
        default:
          return 'primary';
      }
    };

    const statusClasses = `${getStatusClass()}`;

    return (
      <StatusLabel
        text={item}
        variants={getStatusClass()}
        className={`${statusClasses ?? ''}`}
      />
    );
  };
  const sendOrderReminder = async (
    orderId: number | undefined,
    quoteId: number | undefined
  ) => {
    await sendReminder('/order/reminder', {
      order_id: orderId,
      quote_id: quoteId,
    });
  };

  const DownloadPdf = async (data: string) => {
    const response = await generatePdf(`order/order-pdf`, {
      params: {
        order_slug: orderDetails?.slug,
        templateLanguage: data,
      },
    });
    if (response.data) {
      const extractedPath = response.data;
      window.open(`${REACT_APP_API_BASE_URL}/${extractedPath}`, '_blank');
      downloadModal?.closeModal();
    }
  };

  const orderReminder = () => {
    return (
      <div className="flex gap-2">
        {orderDetails?.status !== 'Closed' &&
          orderDetails?.type === 'Private' &&
          ((editAccess && CurrentUser?.id === orderDetails.created_by) ||
            CurrentUser?.role_name === ROLES.Admin) && (
            <Button
              parentClass="h-fit"
              className="action-button primary-btn"
              onClickHandler={() => {
                navigate(
                  `${PRIVATE_NAVIGATION.invoice.add.path}/${orderDetails?.company?.id}/${orderDetails?.id}`
                );
              }}
              tooltipText="Invoice"
            >
              <Image
                iconName="bookIcon"
                iconClassName="stroke-current w-5 h-5"
                width={24}
                height={24}
              />
            </Button>
          )}
        <Button
          parentClass="h-fit"
          className="action-button primary-btn"
          onClickHandler={() => {
            sendOrderReminder(orderDetails?.id, orderDetails?.quotes?.id);
          }}
          tooltipText={t('Tooltip.OrderReminder')}
        >
          <Image iconName="reminderIcon" iconClassName="stroke-current w-5 h-5" />
        </Button>
        <Button
          parentClass="h-fit"
          className="action-button primary-btn"
          onClickHandler={() => {
            downloadModal?.openModal();
          }}
          tooltipText={t('Tooltip.DownloadPDF')}
        >
          <Image iconName="downloadFile2" iconClassName="stroke-current w-5 h-5" />
        </Button>
      </div>
    );
  };

  const LastPODate = () => {
    return (
      <div className="flex">
        <Button
          onClickHandler={() => {
            reminderDateModal?.openModal();
          }}
        >
          {orderDetails?.purchase_reminder_date &&
            format(
              new Date(orderDetails?.purchase_reminder_date),
              REACT_APP_DATE_FORMAT as string
            )}
        </Button>
      </div>
    );
  };

  return (
    <>
      <PageHeader
        small
        text={t('orderDetailsTitle')}
        url={url.searchParams.has('isOrder') ? `/order${url.search}` : `/order`}
      >
        {orderReminder()}
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
            t={t}
            LastPODate={LastPODate()}
            lastPODatePresent={orderDetails?.purchase_reminder_date}
            statusRenderData={statusRender(orderDetails?.status as string)}
            orderDate={
              orderDetails?.type === OrderStatusType.Academic
                ? orderDetails?.created_at
                : ''
            }
          />
          {orderDetails?.quotes ? (
            <ProductDetails
              productData={
                orderDetails?.quotes?.quoteProduct as unknown as ProductDataProps
              }
              quoteData={orderDetails?.quotes as unknown as QuoteDataProps}
              t={t}
            />
          ) : (
            <CourseDetails
              t={t}
              courseData={orderDetails?.course as unknown as CourseDataInvoiceProps}
            />
          )}
          <div className="mt-30px flex flex-wrap -mx-2.5 gap-y-8">
            <div className="991:w-1/2 w-full px-2.5">
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
            <div className="991:w-1/2 w-full  px-2.5">
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
          </div>
          <div className="mt-30px">
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
      {reminderDateModal?.isOpen && (
        <PurchaseOrderReminderModal
          modal={reminderDateModal}
          data={orderDetails as OrderProps}
        />
      )}
    </>
  );
};
