// ** Components
import { Modal } from 'components/Modal/Modal';
import { ViewContactUsProps } from 'modules/ContactUsFormData/types';

// ** Hooks
import { useTranslation } from 'react-i18next';

const ViewContactUs = ({ modal, data, setData }: ViewContactUsProps) => {
  const { t } = useTranslation();

  // ** CONSTs
  const {
    contact_email = '',
    contact_phone = '',
    contact_message = '',
    full_name = '',
    contact_agency = '',
  } = data || {};

  return (
    <Modal
      closeOnOutsideClick
      closeOnEscape
      modal={modal}
      setDataClear={setData}
      headerTitle={t('CMS.ContactUs.ViewFormSubmission')}
    >
      <div className="grid gap-4">
        <p>
          <strong>{t('CMS.ContactUs.full_name')} :</strong>
          <span className="ml-2">{full_name}</span>
        </p>
        <p>
          <strong>{t('CMS.ContactUs.Company')} :</strong>
          <span className="ml-2">{contact_agency}</span>
        </p>
        <p>
          <strong>{t('CMS.ContactUs.Email')} :</strong>
          <span className="ml-2">{contact_email}</span>
        </p>
        <p>
          <strong>{t('CMS.ContactUs.Phone')} :</strong>
          <span className="ml-2">{contact_phone}</span>
        </p>
        <p>
          <strong>{t('CMS.ContactUs.Description')} :</strong>
          <span className="ml-2">{contact_message}</span>
        </p>
      </div>
    </Modal>
  );
};

export default ViewContactUs;
