// ** component **
import Button from 'components/Button/Button';
import ReactSelect from 'components/FormElement/ReactSelect';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import ActivityDisplay from './ActivityDisplay';
import AttachQuote from './AttachQuote';
import { AttachQuoteDisplay } from './AttachQuoteDisplay';
import AttachmentDisplay from './AttachmentDisplay';
import AttachmentUpload from './AttachmentUpload';
import CardModalDescription from './CardModalDescription';
import { CardModalProjectNotes } from './CardModalProjectNotes';
import CompanyDisplay from './CompanyDisplay';
import CompanyModal from './CompanyModal';
import ContactPersonDetail from './ContactPersonDetail';
import FundedAttachment from './FundedAttachment';
import FundedAttachmentDisplay from './FundedAttachmentDisplay';
import LabelDisplay from './LabelDisplay';
import LabelModal from './LabelModal';
import MemberDisplay from './MemberDisplay';
import MemberModal from './MemberModal';
import StageDisplay from './StageDisplay';
import { Rating } from 'react-simple-star-rating';

// ** hooks **
import { useAxiosGet, useAxiosPatch, useAxiosPost } from 'hooks/useAxios';
import { useToggleDropdown } from 'hooks/useToggleDropdown';
import { formatCurrency, getCurrencySymbol } from 'utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

// ** type **
import { Option } from 'components/FormElement/types';
import { Cards, CustomCardType, LabelValuesType, MemberValueType } from '../types';

// ** utils **
import { handleCheckBoxPermission, setCardData, useGetCardDetail } from '../utils';
import _ from 'lodash';

// ** constant **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';
import { ROLES } from 'constants/roleAndPermission.constant';
import { PriorityConst } from '../constant';

// ** slices **
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { getRoles } from 'redux-toolkit/slices/rolePermissionSlice';

// ** enum **
import { CourseStatus } from 'modules/Courses/Constants';
import { StageNameConstant } from '../enum';

const CustomCardModal = ({
  initialBoard,
  CardModal,
  getProjectStages,
  getProjectCards,
  isCoursePipeline = false,
  setInitialBoard,
  isMove,
  isViewable,
}: CustomCardType) => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { state } = useLocation();

  const user = useSelector(getCurrentUser);
  const allRoles = useSelector(getRoles);
  const rolesToPass: Array<number> = [];
  const targetRoles = [ROLES.SalesRep, ROLES.TrainingSpecialist];

  allRoles.forEach((role) => {
    if (targetRoles.toString().includes(role.name)) {
      rolesToPass.push(role.id);
    }
  });

  const [getProjectCardDetail] = useAxiosGet();
  const [resetCard] = useAxiosPost();
  const [updateCardTitle] = useAxiosPatch();
  const [getUsers] = useAxiosGet();
  const [updateCardPatch, { isError }] = useAxiosPatch();
  const { getCardDetail } = useGetCardDetail();

  const labelModal = useToggleDropdown();
  const attachmentModal = useToggleDropdown();
  const fundedAttachmentModal = useToggleDropdown();
  const memberModal = useToggleDropdown();
  const stageModal = useToggleDropdown();
  const attachQuoteModal = useToggleDropdown();
  const managerModal = useToggleDropdown();
  const companyModalRef = useToggleDropdown();

  const boardCardData = (CardModal.modalData as Cards) ?? { columns: [] };

  const [initialBoardData, setInitialBoardData] = useState(boardCardData);
  const [labelValues, setLabelValues] = useState<LabelValuesType>([]);
  const [memberList, setMemberList] = useState<MemberValueType[]>([]);
  const [value, setValue] = useState(initialBoardData?.title);

  const [trainerRating, setTrainerRating] = useState<{ rateAvg: string }>();
  const [getRating] = useAxiosGet();

  const getTrainerRating = async () => {
    const { data } = await getRating(
      `/course/survey-result?course_slug=${initialBoardData?.courses?.[0]?.slug}`
    );
    if (data) setTrainerRating(data);
  };
  useEffect(() => {
    if (isCoursePipeline) getTrainerRating();
  }, [isCoursePipeline]);
  useEffect(() => {
    getLabels();
    getMembers();
  }, []);

  useEffect(() => {
    if (isError) {
      setInitialBoardData(boardCardData);
    }
  }, [isError]);

  useEffect(() => {
    if (!labelModal.isDropdownOpen) {
      setLabelValues(labelValues.filter((data) => !_.isEmpty(data.title)));
    }
  }, [labelModal.isDropdownOpen]);

  useEffect(() => {
    if (isMove?.current) {
      setCardData({
        setInitialBoard,
        keyToInsert: 'card_labels',
        initialBoardData,
        isArray: false,
        updatedData: initialBoardData?.card_labels,
      });
    }
  }, [initialBoardData.card_labels]);

  const getPriorityOption = () => {
    const priorityOption: Option[] = [];
    Object.keys(PriorityConst).forEach((item) => {
      priorityOption.push({
        label: item.charAt(0).toUpperCase() + item.slice(1),
        value: item,
      });
    });
    return priorityOption;
  };

  const getMembers = async (search?: string) => {
    const resp = await getUsers('/users/dropdown', {
      params: {
        role: rolesToPass.toString(),
        search,
        view: true,
      },
    });
    if (resp?.data?.data) {
      const formattedMembers = resp.data.data.map(
        ({
          id,
          first_name,
          full_name,
          chat_user_status,
          role,
        }: MemberValueType) => ({
          id,
          first_name,
          full_name,
          chat_user_status,
          role: { ...role },
        })
      );
      setMemberList(formattedMembers);
    }
  };

  const getLabels = async (search?: string) => {
    const paramsObj: { [key: string]: unknown } = {
      view: true,
    };
    if (search) paramsObj.search = search;

    const resp = await getProjectCardDetail('/label', {
      params: paramsObj,
    });
    if (resp?.data?.data.length > 0) {
      setLabelValues(resp.data.data);
    }
  };

  const cardJoin = async () => {
    const url = isCoursePipeline
      ? '/boards/course-management/card/'
      : '/boards/project-management/card/';

    await updateCardPatch(`/cards/join/${initialBoardData?.id}`, {});
    await getCardDetail({
      url,
      card_id: initialBoardData?.id,
      setInitialBoardCard: setInitialBoardData,
      keyToInsert: 'card_members',
    });
  };

  const OnPriorityChange = async (priorityValue: string) => {
    const { error } = await updateCardPatch(`/cards/${initialBoardData.id}`, {
      priority: priorityValue,
    });
    if (_.isEmpty(error)) {
      if (initialBoardData) initialBoardData.priority = priorityValue;
      // setInitialBoardData((prev) => {
      //   return { ...prev, priority: priorityValue };
      // });
      initialBoard?.columns?.forEach((project) => {
        if (!_.isEmpty(project.cards)) {
          const activeCardPriority = project?.cards?.find(
            (card) => card.card_id === initialBoardData.id
          );
          if (activeCardPriority) activeCardPriority.priority = priorityValue;
        }
      });
    }
  };

  const hasUserJoined = () => {
    let isJoined = false;
    const element = initialBoardData?.card_members?.some((member) => {
      if (member.user_id === Number(user?.id)) {
        isJoined = true;
        return true;
      }
      isJoined = false;
      return false;
    });
    return [
      element ? (
        <span>{t('ProjectManagement.CustomCardModal.Button.joined')}</span>
      ) : (
        <span>{t('ProjectManagement.CustomCardModal.Button.join')}</span>
      ),
      isJoined,
    ];
  };

  const [element, isJoined] = hasUserJoined();

  const handleUpdate = async () => {
    const { error } = await updateCardTitle(
      `/boards/card/${initialBoardData?.project?.slug}`,
      {
        title: value,
      }
    );
    if (!error) {
      await getCardDetail({
        url: '/boards/project-management/card/',
        card_id: initialBoardData?.id,
        setInitialBoardCard: setInitialBoardData,
        isModal: true,
        modal: CardModal,
      });
      getProjectStages?.();
      getProjectCards?.();
    }
  };

  const checkTitleEditable = () => {
    if (!isCoursePipeline && !isViewable) {
      return handleCheckBoxPermission({
        user,
        cardMember: initialBoardData?.card_members,
      });
    }
  };

  const renderSubHeader = () => {
    return (
      <div>
        <span className="inline-block text-xs text-grayText mt-1 me-3">
          {`${t('ProjectManagement.CustomCardModal.inListText')} ${
            initialBoardData?.stage?.name ?? '-'
          }`}
        </span>
        {isCoursePipeline && initialBoardData?.courses?.[0]?.progressive_number ? (
          <span className="mt-1 text-sm w-fit leading-4 px-2.5 py-1.5 inline-flex items-center justify-center rounded-md  bg-green2/10 text-green2">
            {initialBoardData?.courses?.[0]?.progressive_number}
          </span>
        ) : (
          <></>
        )}
      </div>
    );
  };

  return (
    <Modal
      closeOnEscape
      isTitleEditable={checkTitleEditable()}
      headerTitle={initialBoardData?.title ?? '-'}
      modal={CardModal}
      handleUpdate={handleUpdate}
      value={value ?? ''}
      setValue={setValue}
      subHeaderComponent={renderSubHeader()}
    >
      <div className="flex flex-wrap">
        <div className="max-w-[calc(100%_-_220px)] w-full flex flex-col">
          <div className="flex flex-wrap gap-5 xl:gap-7 2xl:gap-10">
            {/* Member display */}
            <MemberDisplay
              isViewable={isViewable}
              memberModal={memberModal}
              initialBoardData={initialBoardData}
            />

            {/* Labels Display */}
            <LabelDisplay
              isViewable={isViewable}
              initialBoardData={initialBoardData}
              labelModal={labelModal}
            />

            {/* Attached Quotes */}
            {!isCoursePipeline && (
              <AttachQuoteDisplay
                projectQuote={initialBoardData?.project?.project_quotes}
                isViewable={
                  initialBoardData?.stage?.name ===
                    StageNameConstant.DateConfirmed ||
                  initialBoardData?.stage?.name ===
                    StageNameConstant.CourseCompleted ||
                  initialBoardData?.stage?.name ===
                    StageNameConstant.CoursesStandby ||
                  initialBoardData?.stage?.name === StageNameConstant.ProjectRejected
                }
                attachQuoteModal={attachQuoteModal}
              />
            )}

            {/* Company display */}
            {!isCoursePipeline && (
              <div className="w-full">
                <CompanyDisplay
                  isViewable={isViewable}
                  companyModal={companyModalRef}
                  initialBoardData={initialBoardData}
                />
              </div>
            )}

            {/* Course Rating  */}
            {isCoursePipeline && (
              <div>
                <span className="block w-full text-sm leading-4 text-grayText mb-2.5">
                  {t('courseRating')}
                </span>
                <div className="flex gap-2 items-center">
                  <Rating
                    size={25}
                    initialValue={
                      Number.isNaN(Number(trainerRating?.rateAvg))
                        ? 0
                        : Number(trainerRating?.rateAvg)
                    }
                    transition
                    readonly
                    allowFraction
                    SVGstyle={{ display: 'inline' }}
                  />
                  {trainerRating?.rateAvg && (
                    <div className="font-medium text-[12px] leading-[12px] mt-1 text-grayText">
                      {Number.isNaN(Number(trainerRating?.rateAvg))
                        ? 0
                        : Number(trainerRating?.rateAvg)}
                      /5
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Revenue */}
          {initialBoardData?.revenue ? (
            <div className="text-current text-sm font-medium mt-5">
              {t('reports.revenueTitle')}:&nbsp;
              <Button className="text-current font-normal mx-1">
                {getCurrencySymbol('EUR')}{' '}
                {formatCurrency(Number(initialBoardData.revenue), 'EUR')}
              </Button>
            </div>
          ) : (
            ''
          )}

          {/* Description Display */}
          <CardModalDescription
            isViewable={isViewable}
            card_id={initialBoardData?.id}
            desc={initialBoardData?.description}
          />

          {/* Project notes */}
          <CardModalProjectNotes projectDetail={initialBoardData?.project} />

          {/* Contact person details */}
          {!isCoursePipeline && (
            <ContactPersonDetail initialBoardData={initialBoardData} />
          )}

          {/* Attachments */}
          <AttachmentDisplay
            isViewable={isViewable}
            isMove={isMove}
            setInitialBoard={setInitialBoard}
            initialBoardData={initialBoardData}
            setInitialBoardData={setInitialBoardData}
            isCoursePipeline={isCoursePipeline}
          />
          {/* Funded Attachments Display */}
          <FundedAttachmentDisplay
            isViewable={isViewable}
            isMove={isMove}
            parentClass="mb-auto"
            setInitialBoard={setInitialBoard}
            initialBoardData={initialBoardData}
            setInitialBoardData={setInitialBoardData}
          />

          {/* Activity */}
          <ActivityDisplay
            isViewable={isViewable}
            // className="mt-7"
            isMove={isMove}
            setInitialBoard={setInitialBoard}
            setInitialBoardData={setInitialBoardData}
            initialBoardData={initialBoardData}
            isCoursePipeline={isCoursePipeline}
          />
        </div>
        {!isViewable && (
          <div className="max-w-[150px] w-full flex flex-col gap-y-6 ms-auto">
            <div id="member" className="flex flex-col gap-y-3">
              <span className="text-sm text-dark block">
                {t('ProjectManagement.CustomCardModal.Button.addCard')}
              </span>

              <Button
                disabled={
                  (isJoined as boolean) ||
                  initialBoardData.stage?.name === StageNameConstant.CoursesStandby
                }
                onClickHandler={() => cardJoin()}
                className="flex gap-1.5 !text-grayText !px-2 !font-normal !justify-start"
                variants="whiteBordered"
              >
                <span className="w-4 h-4 inline-block">
                  <Image iconName="userjoinIcon" iconClassName="w-full h-full" />
                </span>
                {user && !_.isEmpty(initialBoardData?.card_members) ? (
                  (element as JSX.Element)
                ) : (
                  <span>{t('ProjectManagement.CustomCardModal.Button.join')}</span>
                )}
              </Button>
              {/* Member Modal */}
              <div
                ref={memberModal.dropdownRef}
                className={`relative  ${memberModal.isDropdownOpen ? 'z-1' : ''}`}
              >
                <Button
                  className="flex gap-1.5 !text-grayText !px-2 !font-normal w-full !justify-start"
                  variants={`${
                    memberModal.isDropdownOpen ? 'primaryBordered' : 'whiteBordered'
                  }`}
                  onClickHandler={() => {
                    memberModal.toggleDropdown();
                  }}
                  disabled={
                    initialBoardData.stage?.name === StageNameConstant.CoursesStandby
                  }
                >
                  <span className="w-4 h-4 inline-block">
                    <Image iconName="userGroupIcon" iconClassName="w-full h-full" />
                  </span>
                  {t('ProjectManagement.CustomCardModal.Button.member')}
                </Button>
                {memberModal.isDropdownOpen && (
                  <MemberModal
                    isCoursePipeline={isCoursePipeline}
                    getMember={getMembers}
                    setInitialBoardData={setInitialBoardData}
                    selectedMember={initialBoardData?.card_members}
                    memberList={memberList}
                    modalRef={memberModal}
                    card_id={initialBoardData?.id}
                  />
                )}
              </div>

              {/* Label Modal */}
              <div
                className={`relative ${labelModal.isDropdownOpen && 'z-1'}`}
                ref={labelModal.dropdownRef}
              >
                <Button
                  className="flex gap-1.5 !text-grayText !px-2 !font-normal w-full !justify-start"
                  variants={`${
                    labelModal.isDropdownOpen ? 'primaryBordered' : 'whiteBordered'
                  }`}
                  onClickHandler={() => {
                    labelModal.toggleDropdown();
                  }}
                >
                  <span className="w-4 h-setInitialBoard={setInitialBoard}4 inline-block">
                    <Image iconName="bookmarkIcon" iconClassName="w-full h-full" />
                  </span>
                  {t('ProjectManagement.CustomCardModal.Button.label')}
                </Button>
                {labelModal.isDropdownOpen && (
                  <LabelModal
                    isCoursePipeline={isCoursePipeline}
                    setInitialBoardData={setInitialBoardData}
                    getLabels={getLabels}
                    selectedLabels={initialBoardData?.card_labels}
                    cardMember={initialBoardData?.card_members}
                    card_id={initialBoardData?.id}
                    modalRef={labelModal}
                    labelValues={labelValues}
                    setLabelValues={setLabelValues}
                    isMove={isMove}
                  />
                )}
              </div>

              {/* Attachment Modal */}
              <div
                className={`relative ${attachmentModal.isDropdownOpen && 'z-1'}`}
                ref={attachmentModal.dropdownRef}
              >
                <Button
                  className="flex gap-1.5 !text-grayText !px-2 !font-normal w-full !justify-start"
                  variants={`${
                    attachmentModal.isDropdownOpen
                      ? 'primaryBordered'
                      : 'whiteBordered'
                  }`}
                  onClickHandler={() => {
                    attachmentModal.toggleDropdown();
                  }}
                  disabled={
                    initialBoardData.stage?.name === StageNameConstant.CoursesStandby
                  }
                >
                  <span className="w-4 h-4 inline-block">
                    <Image iconName="linkIcon" iconClassName="w-full h-full" />
                  </span>
                  {t('ProjectManagement.CustomCardModal.Button.attachment')}
                </Button>

                {attachmentModal.isDropdownOpen && (
                  <AttachmentUpload
                    isMove={isMove}
                    setInitialBoard={setInitialBoard}
                    setInitialBoardCard={setInitialBoardData}
                    modalRef={attachmentModal}
                    initialBoardData={initialBoardData}
                    isCoursePipeline={isCoursePipeline}
                  />
                )}
              </div>

              {/* Funded Document Modal */}
              <div
                className={`relative ${
                  fundedAttachmentModal.isDropdownOpen && 'z-1'
                }`}
                ref={fundedAttachmentModal.dropdownRef}
              >
                <Button
                  className="flex gap-1.5 !text-grayText !px-2 !font-normal w-full !justify-start !text-left"
                  variants={`${
                    fundedAttachmentModal.isDropdownOpen
                      ? 'primaryBordered'
                      : 'whiteBordered'
                  }`}
                  onClickHandler={() => {
                    fundedAttachmentModal.toggleDropdown();
                  }}
                  disabled={
                    initialBoardData.stage?.name === StageNameConstant.CoursesStandby
                  }
                >
                  <span className="w-4 h-4 inline-block shrink-0">
                    <Image iconName="linkIcon" iconClassName="w-full h-full" />
                  </span>
                  {t('ProjectManagement.CustomCardModal.Button.fundedAttachment')}
                </Button>

                {fundedAttachmentModal.isDropdownOpen && (
                  <FundedAttachment
                    isMove={isMove}
                    setInitialBoard={setInitialBoard}
                    setInitialBoardCard={setInitialBoardData}
                    modalRef={fundedAttachmentModal}
                    initialBoardData={initialBoardData}
                  />
                )}
              </div>

              {/* Company Modal */}
              {!isCoursePipeline && (
                <div
                  className={`relative ${companyModalRef.isDropdownOpen && 'z-1'}`}
                  ref={companyModalRef.dropdownRef}
                >
                  <Button
                    className="flex gap-1.5 !text-grayText !px-2 !font-normal w-full !justify-start"
                    variants={`${
                      managerModal.isDropdownOpen
                        ? 'primaryBordered'
                        : 'whiteBordered'
                    }`}
                    onClickHandler={() => {
                      companyModalRef.toggleDropdown();
                    }}
                    disabled={
                      initialBoardData.stage?.name ===
                      StageNameConstant.CoursesStandby
                    }
                  >
                    <span className="w-4 h-4 inline-block">
                      <Image iconName="companyIcon" iconClassName="w-full h-full" />
                    </span>
                    {t('ProjectManagement.CustomCardModal.Button.company')}
                  </Button>

                  {companyModalRef.isDropdownOpen && (
                    <CompanyModal
                      projectId={initialBoardData?.project?.id}
                      card_id={initialBoardData?.id}
                      cardMember={initialBoardData?.card_members}
                      modalRef={companyModalRef}
                      selectedCompany={initialBoardData?.card_Company}
                      setInitialBoardData={setInitialBoardData}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-y-3">
              <span className="text-sm text-dark">
                {t('ProjectManagement.CustomCardModal.Button.action')}
              </span>

              {/* Stage Modal */}
              <div
                ref={stageModal.dropdownRef}
                className={`relative ${stageModal.isDropdownOpen && 'z-1'}`}
              >
                <Button
                  onClickHandler={() => stageModal.toggleDropdown()}
                  className="flex gap-1.5 !text-grayText !px-2 !font-normal w-full !justify-start"
                  variants="whiteBordered"
                >
                  <span className="w-4 h-4 inline-block">
                    <Image iconName="sendSquareIcon" iconClassName="w-full h-full" />
                  </span>
                  {t('ProjectManagement.CustomCardModal.Button.move')}
                </Button>

                {stageModal.isDropdownOpen && initialBoardData?.stage_id && (
                  <StageDisplay
                    initialBoard={initialBoard}
                    stage_id={initialBoardData?.stage_id}
                    quotesLength={initialBoardData?.project?.project_quotes?.length}
                    card_id={initialBoardData?.id}
                    modal={stageModal}
                    CardModal={CardModal}
                    getProjectStages={getProjectStages}
                    isMove={isMove}
                    cardMember={initialBoardData?.card_members}
                    setInitialBoard={setInitialBoard}
                  />
                )}
              </div>

              {/* Project Button */}
              {isCoursePipeline && (
                <Button
                  disabled={_.isEmpty(initialBoardData?.courses)}
                  onClickHandler={() => {
                    CardModal.closeModal();
                    if (isCoursePipeline && !_.isEmpty(state)) {
                      navigate(PRIVATE_NAVIGATION.projectManagement.view.path, {
                        state: {
                          ComingProjectId: !_.isEmpty(state) && state.cardId,
                        },
                      });
                    } else {
                      navigate(PRIVATE_NAVIGATION.projectManagement.view.path, {
                        state: {
                          ComingProjectId:
                            initialBoardData?.courses?.[0]?.projects?.card_id ??
                            null,
                        },
                      });
                    }
                  }}
                  className="flex gap-1.5 !text-grayText !px-2 !font-normal w-full !justify-start"
                  variants="whiteBordered"
                >
                  <span className="w-4 h-4 inline-block">
                    <Image
                      iconName="projectManagementIcon"
                      iconClassName="w-full h-full"
                    />
                  </span>
                  {t('ProjectManagement.CustomCardModal.Button.project')}
                </Button>
              )}

              {/* Reset Button */}
              {initialBoardData?.stage?.name === StageNameConstant.CoursesStandby &&
                !isCoursePipeline && (
                  <Button
                    className="flex gap-1.5 !text-grayText !px-2 !font-normal w-full !justify-start"
                    variants="whiteBordered"
                    onClickHandler={async () => {
                      await resetCard(`/cards/reset/${initialBoardData?.id}`, {});
                      isMove.current = false;
                      getProjectStages();
                      CardModal.closeModal();
                    }}
                  >
                    <span className="w-4 h-4 inline-block">
                      <Image iconName="refreshIcon" iconClassName="w-full h-full" />
                    </span>
                    {t('ProjectManagement.CustomCardModal.Button.reset')}
                  </Button>
                )}

              {/* Course Buttons */}
              {isCoursePipeline && (
                <>
                  <Button
                    onClickHandler={() => {
                      CardModal.closeModal();
                      if (isCoursePipeline) {
                        window.open(
                          `/courses/view/${initialBoardData?.courses?.[0]?.slug}?status=${initialBoardData?.courses?.[0]?.status}`
                        );
                      }
                    }}
                    className="flex gap-1.5 !text-grayText !px-2 !font-normal w-full !justify-start"
                    variants="whiteBordered"
                  >
                    <span className="w-4 h-4 inline-block">
                      <Image iconName="eyeIcon" iconClassName="w-full h-full" />
                    </span>
                    {t('ProjectManagement.CustomCardModal.Button.courseView')}
                  </Button>
                  {user?.role_name !== ROLES.SalesRep &&
                    initialBoardData?.courses?.[0]?.status !==
                      CourseStatus.publish &&
                    [
                      StageNameConstant.DateRequested,
                      StageNameConstant.DateProposed,
                    ].includes(
                      initialBoardData?.stage?.name as StageNameConstant
                    ) && (
                      <Button
                        onClickHandler={() => {
                          if (isCoursePipeline) {
                            window.open(
                              `/course-management/edit?slug=${initialBoardData?.courses?.[0]?.slug}`,

                              '_blank'
                            );
                          }
                        }}
                        className="flex gap-1.5 !text-grayText !px-2 !font-normal w-full !justify-start"
                        variants="whiteBordered"
                      >
                        <span className="w-4 h-4 inline-block">
                          <Image iconName="editIcon" iconClassName="w-full h-full" />
                        </span>
                        {t('ProjectManagement.CustomCardModal.Button.courseEdit')}
                      </Button>
                    )}
                </>
              )}
              {/* AttachQuot Modal && Pipeline Button */}
              {!isCoursePipeline && (
                <>
                  <div
                    className={`relative ${
                      attachQuoteModal.isDropdownOpen && 'z-1'
                    }`}
                    ref={attachQuoteModal.dropdownRef}
                  >
                    <Button
                      disabled={
                        initialBoardData.stage?.name ===
                          StageNameConstant.DateConfirmed ||
                        initialBoardData.stage?.name ===
                          StageNameConstant.CourseCompleted ||
                        initialBoardData.stage?.name ===
                          StageNameConstant.CoursesStandby ||
                        initialBoardData.stage?.name ===
                          StageNameConstant.ProjectRejected
                      }
                      onClickHandler={() => {
                        attachQuoteModal.toggleDropdown();
                      }}
                      className="flex gap-1.5 !text-grayText !px-2 !font-normal w-full !justify-start"
                      variants="whiteBordered"
                    >
                      <span className="w-4 h-4 inline-block">
                        <Image iconName="linkIcon" iconClassName="w-full h-full" />
                      </span>
                      {t('ProjectManagement.CustomCardModal.Button.attachQuote')}
                    </Button>
                    {attachQuoteModal.isDropdownOpen && (
                      <AttachQuote
                        CardModal={CardModal}
                        modal={attachQuoteModal}
                        card_id={initialBoardData?.id}
                        company_id={initialBoardData?.company_id}
                        quotes={initialBoardData?.project?.project_quotes}
                        getProjectStages={getProjectStages}
                        isMove={isMove}
                      />
                    )}
                  </div>
                  <Button
                    className="flex gap-1.5 !text-grayText !px-2 !font-normal !justify-start"
                    variants="whiteBordered"
                    onClickHandler={() =>
                      navigate(PRIVATE_NAVIGATION.coursePipeline.view.path, {
                        state: {
                          ProjectName: `${initialBoardData?.title ?? '-'}`,
                          ProjectId: initialBoardData?.project?.id,
                          cardId: initialBoardData?.id,
                        },
                      })
                    }
                  >
                    <span className="w-4 h-4 inline-block">
                      <Image
                        iconName="notePencilStrokeSD"
                        iconClassName="w-full h-full"
                      />
                    </span>
                    {t('ProjectManagement.CustomCardModal.Button.pipeline')}
                  </Button>
                </>
              )}
            </div>

            {/* Priority DropDown */}
            {!isCoursePipeline && (
              <div className="flex flex-col gap-y-3">
                <div className="relative z-0">
                  <span className="text-sm text-dark">
                    {t('ProjectManagement.CustomCardModal.Button.priority')}
                  </span>
                  <ReactSelect
                    isSearchable={false}
                    isMulti={false}
                    options={getPriorityOption()}
                    className="text-sm font-medium py-2.5  rounded-md w-full"
                    selectedValue={initialBoardData.priority}
                    onChange={(value) => {
                      OnPriorityChange((value as Option).value as string);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CustomCardModal;
