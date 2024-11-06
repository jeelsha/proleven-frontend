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
import { useGetCardDetail } from '../utils';

// ** type **
import { fileInputEnum } from 'components/FormElement/types';
import { AttachmentModalProps } from '../types';

// ** style **
import Checkbox from 'components/FormElement/CheckBox';
import { SetFieldValue } from 'types/common';
import '../style/index.css';
import { CardAttachmentValidation } from '../validationSchema';

const AttachmentUpload = ({
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
    card_attachment: [],
    trainer: false,
    company_manager: false,
  };

  const onSubmit = async (userData: FormikValues) => {
    const card_id = initialBoardData.id;
    if (isMove) {
      isMove.current = true;
    }
    const url = isCoursePipeline
      ? '/boards/course-management/card/'
      : '/boards/project-management/card/';
    if (!_.isEmpty(userData.card_attachment)) {
      // Use map to modify each file in the attachment array
      const cardAttachment = new FormData();
      userData.card_attachment.forEach((element: File) => {
        cardAttachment.append('card_attachment', element);
      });
      if (isCoursePipeline) {
        cardAttachment.append('show_trainer', userData.trainer);
        cardAttachment.append('show_company_manager', userData.company_manager);
      }
      await cardAttach(`/cards/attachment/${card_id}`, cardAttachment);
      await getCardDetail({
        url,
        card_id,
        setInitialBoardCard,
      });
      modalRef.closeDropDown();
    }
  };
  const handleChange = (
    checkData: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: SetFieldValue,
    item: string
  ) => {
    const isChecked = checkData.target.checked;

    setFieldValue(item, isChecked);
  };

  return (
    <div className="absolute top-0 right-[calc(100%_+_7px)]">
      <div className="w-[350px] overflow-auto bg-white rounded-lg shadow-lg shadow-black/20 border">
        <div className="attachment-modal-title">
          <p className="text-base font-semibold leading-5 text-dark">
            {t('ProjectManagement.CustomCardModal.Button.attachment')}
          </p>
        </div>
        <div className="p-5 rounded-b-lg">
          <Formik
            initialValues={initialValues}
            validationSchema={CardAttachmentValidation(t)}
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
                    fileType={[EnumFileType.Image,EnumFileType.Document]}
                    acceptTypes={AttachmentFileType}
                    name="card_attachment"
                    setValue={setFieldValue}
                    value={values.card_attachment}
                    SubTitle={t(
                      'ProjectManagement.CustomCardModal.Button.fundedAttachmentSubtitle'
                    )}
                  />

                  {isCoursePipeline && (
                    <>
                      <p className="text-base font-semibold leading-5 text-dark  justify-start mt-3">
                        {t('ProjectManagement.CustomCardModal.attachmentVisibleTo')}
                      </p>
                      <div className="flex">
                        <Checkbox
                          parentClass="h-fit"
                          name="trainer"
                          check={values.trainer}
                          showError={false}
                          onChange={(checkData) => {
                            handleChange(checkData, setFieldValue, 'trainer');
                          }}
                        />
                        <span className="ml-2">Trainer</span>
                      </div>
                      <div className="flex">
                        <Checkbox
                          parentClass="h-fit"
                          name="company_manager"
                          check={values.company_manager}
                          showError={false}
                          onChange={(checkData) => {
                            handleChange(
                              checkData,
                              setFieldValue,
                              'company_manager'
                            );
                          }}
                        />
                        <span className="ml-2">Company Manager</span>
                      </div>
                    </>
                  )}
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

export default AttachmentUpload;
