import { Form, Formik, FormikValues } from 'formik';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

// ** component **
import Button from 'components/Button/Button';
import DropZone from 'components/FormElement/DropZoneField';

// ** enum **
import { EnumFileType } from 'components/FormElement/enum';

// ** constant **
import { fileAcceptType } from 'modules/Chat/constants';

// ** hooks **
import { useAxiosPost } from 'hooks/useAxios';

// ** utils **
import { fileInputEnum } from 'components/FormElement/types';
import { AttachmentModalProps } from '../types';
import { useGetCardDetail } from '../utils';

// ** style **
import '../style/index.css';

const FundedAttachment = ({
  modalRef,
  setInitialBoardCard,
  isCoursePipeline,
  initialBoardData,
  isMove,
}: AttachmentModalProps) => {
  const { t } = useTranslation();

  const [cardAttach, { isLoading }] = useAxiosPost();
  const { getCardDetail, isLoading: fetchCardLoading } = useGetCardDetail();
  const AttachmentFileType = ([EnumFileType.Image, EnumFileType.Document] as unknown as keyof typeof fileAcceptType).toString()


  const initialValues = {
    funded_by_attachment: [],
  };

  const onSubmit = async (userData: FormikValues) => {
    const card_id = initialBoardData.id;
    if (isMove) {
      isMove.current = true;
    }
    const url = isCoursePipeline
      ? '/boards/course-management/card/'
      : '/boards/project-management/card/';
    if (!_.isEmpty(userData.funded_by_attachment)) {
      // Use map to modify each file in the attachment array
      const cardAttachment = new FormData();
      userData.funded_by_attachment.forEach((element: File) => {
        cardAttachment.append('funded_documents', element);
      });

      await cardAttach(`/cards/funded-attachment/${card_id}`, cardAttachment);
      await getCardDetail({
        url,
        card_id,
        setInitialBoardCard,
      });
      modalRef.closeDropDown();
    }
  };

  return (
    <div className="absolute top-0 right-[calc(100%_+_7px)]">
      <div className="w-[350px] overflow-auto bg-white rounded-lg shadow-lg shadow-black/20 border">
        <div className="attachment-modal-title">
          <p className="text-base font-semibold leading-5 text-dark">
            {t('ProjectManagement.CustomCardModal.Button.fundedAttachment')}
          </p>
        </div>
        <div className="p-5 rounded-b-lg">
          <Formik
            initialValues={initialValues}
            onSubmit={(values) => onSubmit(values)}
          >
            {({ values, setFieldValue }) => (
              <Form>
                <div className="flex flex-col gap-3">
                  <DropZone
                    variant={fileInputEnum.FileInput}
                    className="col-span-2"
                    limit={4}
                    isMulti
                    fileType={[EnumFileType.Image, EnumFileType.Document]}
                    acceptTypes={AttachmentFileType}
                    name="funded_by_attachment"
                    setValue={setFieldValue}
                    fileInputIcon="fileIcon"
                    value={values.funded_by_attachment}
                    SubTitle={t(
                      'ProjectManagement.CustomCardModal.Button.fundedAttachmentSubtitle'
                    )}
                  />
                  <div className="flex justify-end mt-2 gap-3">
                    <Button
                      className="min-w-[75px] justify-center"
                      variants="whiteBordered"
                      onClickHandler={() => modalRef.toggleDropdown()}
                    >
                      {t('Button.cancelButton')}
                    </Button>
                    <Button
                      className="min-w-[75px] justify-center"
                      variants="primary"
                      disabled={isLoading || fetchCardLoading}
                      isLoading={isLoading || fetchCardLoading}
                      type="submit"
                    >
                      {t('ProjectManagement.CustomCardModal.Button.save')}
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default FundedAttachment;
