// **components**
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import { UserModalType } from 'hooks/types';
import { ITemplate } from 'modules/CertificateTemplate/types';

// **hooks**
import { useTranslation } from 'react-i18next';
import { replaceTemplateTagsWithBraces } from 'utils';

type versionListingProps = {
  modal: UserModalType;
  selectedData: ITemplate | null;
};
export const ViewCertificateModal = ({
  modal,
  selectedData,
}: versionListingProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      closeOnEscape
      closeOnOutsideClick
      width="max-w-[800px]"
      modal={modal}
      headerTitle={t('SendMail.viewTemplate')}
    >
      <>
        <div className="outline-primary2 outline-[3px] border-[3px] border-primary text-center mb-5 p-10 mx-10 ">
          <div className=" ms-auto w-[92px] max-w-full mb-6">
            <Image src="/logo.png" imgClassName="w-full h-auto" />
          </div>

          <div
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: replaceTemplateTagsWithBraces(selectedData?.content),
            }}
            className=" text-sm leading-normal font-normal content-wrapper [&_img]:max-w-[120px] [&_img]:h-auto [&_img]:object-contain [&_img]:ml-0"
          />
        </div>
        <div className="relative outline-primary2 outline-[3px] border-[3px] border-primary text-center mb-5 py-10 px-6 mx-10">
          <div className="absolute right-5 top-5 w-[92px] max-w-full ">
            <Image src="/logo.png" imgClassName="w-full h-auto" />
          </div>
          <div className="group-text text-black text-sm leading-6 mb-3 text-left">
            <p className=" font-bold ">{t('courseProgram')}</p>
            <p className=" font-normal ">@ProgrammaCorso</p>
          </div>
          <div className="group-text text-black text-sm leading-6 mb-3 text-left">
            <p className=" font-bold ">{t('duration')}</p>
            <p className=" font-normal ">@DurataCorso ore</p>
          </div>
          <div className="group-text text-black text-sm leading-6 mb-3 text-left">
            <p className=" font-bold ">{t('CompanyManager.courseDetails.mode')}</p>
            <p className=" font-normal ">@ModalitàCorso</p>
          </div>
          <div className="mt-20 text-[10px] font-montserrat text-center leading-snug">
            Soggetto formatore: Proleven S.r.l. - Via del Lavoro, 71-40033 Casalecchio di Reno (BO) - P.IVA e C.F. 03298561204
            Tel. 051 571193 - E-mail: formazione@proleven.com - <a href="www.proleven.com">www.proleven.com</a>
          </div>
          {/* <div className="mb-20" /> */}
        </div>
      </>
    </Modal>
  );
};
