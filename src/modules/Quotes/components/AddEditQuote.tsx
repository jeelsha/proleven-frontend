// ** imports **
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';

// ** components **
import CustomCard from 'components/Card';
import PageHeader from 'components/PageHeader/PageHeader';

// ** hooks **
import { useAxiosGet } from 'hooks/useAxios';

// ** constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { quoteInitialValue } from 'modules/Quotes/constants';

// ** styles **
import 'modules/Quotes/styles/quotes.css';

// ** types **
import { ROLES } from 'constants/roleAndPermission.constant';
import { useTitle } from 'hooks/useTitle';
import {
  Attachment,
  Product,
  Quote,
  QuoteInitialProps,
  QuoteResponseValues,
} from 'modules/Quotes/types';
import { useSelector } from 'react-redux';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';
import QuoteForm from './QuoteForm';

const AddEditQuote = () => {
  const [initialValues, setInitialValues] = useState(quoteInitialValue);
  const [getQuoteApi, { isLoading: updateQuoteLoading }] = useAxiosGet();
  const { t } = useTranslation();
  const allRoles = useSelector(getRoles);
  const currentRole = allRoles.find((role) => role.name === ROLES.SalesRep);
  const updateTitle = useTitle();
  const { slug, companySlug } = useParams();
  const slugValue = slug;
  const [issuedBy, setIssuedBy] = useState<string | undefined>('');

  const location = useLocation();
  const isClone = location.pathname.includes('/clone');

  const QuoteDataFields = (quote: QuoteResponseValues): Quote => ({
    ...(!isClone ? { id: quote.id } : {}),
    address: quote?.address,
    comments: quote?.comments,
    city: quote?.city,
    country: quote?.country,
    email: quote?.email,
    destination_goods: quote?.destination_goods,
    total_discount: quote?.total_discount,
    total_amount: quote?.total_amount,
    total_vat_amount: quote?.total_vat_amount,
    company_id: quote?.company_id,
    date: isClone ? new Date() : quote?.date,
    payment_method: quote?.payment_method,
    telephone: quote?.telephone,
    mobile_number: quote?.mobile_number,
    cap_number: quote?.cap_number,
    province: quote?.company?.address_province,
    is_destination_goods: quote?.is_destination_goods,
    sales_rep_id: quote?.sales_rep_id,
    destination_email: quote.destination_email,
    destination_cap: quote.destination_cap,
    destination_province: quote?.destination_province,
    codice_fiscale: quote?.codice_fiscale,
    cod_dest: quote?.cod_dest,
    quote_type: quote?.quote_type,
    destination_mobile_number: quote?.destination_mobile_number,
    destination_telephone: quote?.destination_telephone,
    payment_term_id: Number(quote.payment_term_id),
    funded_by: quote?.funded_by,
    ...(!isClone ? { quote_number: quote?.quote_number } : {}),
    academy: quote?.academy,
    currency: quote?.currency,
    vat_type: quote?.vat_type,
    vat_type_id: quote?.company?.vat_type,
    vat_primary_id: quote?.company?.vat_primary_id,
  });

  const mapProductFields = (product: Product): Product => {
    const mappedProduct = {
      ...(!isClone ? { id: product.id } : {}),
      units: product.units,
      price: product.price,
      discount: product.discount,
      ...(!isClone ? { quote_id: product.quote_id } : {}),
      code_id: product.code_id,
      vat_number: product.vat_number,
      product_total_amount: product.product_total_amount,
      description: product.description,
      title: product.title,
      product_type: product.product_type,
      product_sequence: product.product_sequence,
      vat_type: product?.vat_type,
      vat_type_id: product?.vat_type_id,
      vat_primary_id: product?.vat_primary_id,
    };

    Object.keys(mappedProduct).forEach((key) => {
      if (mappedProduct[key as keyof typeof mappedProduct] === null) {
        delete mappedProduct[key as keyof typeof mappedProduct];
      }
    });

    return mappedProduct as Product;
  };

  const fetchQuote = async () => {
    const { data } = await getQuoteApi(`/quotes`, {
      params: { slug: slugValue, sort: 'id' },
    });
    if (data) {
      let quoteData = {} as QuoteInitialProps;
      quoteData = {
        quote: QuoteDataFields(data),
        product: (data.quoteProduct ?? []).map(mapProductFields),
        attachment: data.quoteAttachment,
        internal_attachment:
          (data?.quoteAttachment ?? [])
            .filter((item: Attachment) => item?.attachment_type === 'internal')
            .map((item: Attachment) => item.attachment) ?? [],
        client_attachment:
          (data?.quoteAttachment ?? [])
            .filter((item: Attachment) => item?.attachment_type === 'client')
            .map((item: Attachment) => item.attachment) ?? [],
      };
      if (isClone) {
        const companyResponse = await getQuoteApi(`/companies/${companySlug}`, {
          params: { role: currentRole?.id.toString() },
        });
        quoteData.company = companyResponse.data;
        quoteData.quote.sales_rep_id = companyResponse?.data?.sales_rep?.id;
        quoteData.quote.vat_primary_id = Number(
          companyResponse?.data?.vat_primary_id
        );
        quoteData.quote.vat_type_id = Number(companyResponse?.data?.vat_type_id);
        quoteData.quote.vat_type = Number(companyResponse?.data?.vat_type);
        quoteData.quote.destination_province =
          companyResponse?.data?.address_province;
        quoteData.quote.payment_term_id = Number(
          companyResponse?.data?.payment_term_id
        );
      } else {
        quoteData.company = data.company;
      }
      setInitialValues(quoteData);
    }
  };

  useEffect(() => {
    if (slugValue) {
      fetchQuote();
      setIssuedBy(initialValues?.quote?.academy);
    }
  }, [slugValue, initialValues?.quote?.academy]);

  updateTitle(slugValue ? t('Quote.updateTitle') : t('Quote.addTitle'));
  return (
    <>
      <PageHeader
        small
        text={isClone || !slugValue ? t('Quote.addTitle') : t('Quote.updateTitle')}
        url={PRIVATE_NAVIGATION.quotes.list.path}
      />
      <CustomCard>
        <QuoteForm
          formData={initialValues}
          setInitialValues={setInitialValues}
          slug={slugValue}
          updateQuoteLoading={updateQuoteLoading}
          isClone={isClone}
          setIssuedBy={setIssuedBy}
          issuedBy={issuedBy}
        />
      </CustomCard>
    </>
  );
};

export default AddEditQuote;
