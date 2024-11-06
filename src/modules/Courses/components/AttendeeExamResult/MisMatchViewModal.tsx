// ** imports **
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalProps } from 'types/common';

// ** components **
import { CardDetails } from 'components/Card/CardDetails';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';

// ** hooks **
import { useAxiosGet } from 'hooks/useAxios';

// ** styles **
import 'modules/Courses/style/index.css';

// ** types **
import { TabDetailProps } from 'modules/Courses/types/survey';

const MisMatchViewModal = ({
  modal,
  viewSlug,
}: {
  modal: ModalProps;
  viewSlug: string;
}) => {
  const { t } = useTranslation();
  const [MisMatchRecords] = useAxiosGet();
  const [attendeeDetail, setAttendeeDetail] = useState<TabDetailProps | undefined>();
  async function CallApi() {
    const response = await MisMatchRecords(`/course/participates`, {
      params: {
        slug: viewSlug,
      },
    });
    setAttendeeDetail(response?.data);
  }
  useEffect(() => {
    CallApi();
  }, []);
  return (
    <Modal
      width="!max-w-[600px]"
      headerTitle={t('attendee.mismatchTitle')}
      modal={modal}
    >
      <div className="mis-match-card">
        <span className="text-lg  text-primary font-semibold flex gap-x-2">
          <Image iconName="userIcon2" />
          {t('CompanyManager.AttendeeList.attendeeInfoTitle')}
        </span>
        <div className="w-full">
          <ul className="flex flex-wrap justify-between gap-y-8">
            <CardDetails
              label={t('CompanyManager.AttendeeList.firstNameView')}
              value={attendeeDetail?.first_name}
            />
            <CardDetails
              label={t('CompanyManager.AttendeeList.lastNameView')}
              value={attendeeDetail?.last_name}
            />
            <CardDetails
              label={t('CompanyManager.AttendeeList.emailView')}
              value={attendeeDetail?.email}
            />

            <CardDetails
              label={t('CompanyManager.AttendeeList.mobileView')}
              value={attendeeDetail?.mobile_number}
            />
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default MisMatchViewModal;
