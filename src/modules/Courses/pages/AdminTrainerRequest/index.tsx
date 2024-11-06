import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import Image from 'components/Image';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import NoDataFound from 'components/NoDataFound';
import StatusLabel from 'components/StatusLabel';
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';
import { useTitle } from 'hooks/useTitle';
import { TFunction } from 'i18next';
import _ from 'lodash';
import { IAssignedBundleTrainer } from 'modules/Courses/types/assignedBundleTrainer';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { setToast } from 'redux-toolkit/slices/toastSlice';
import { customRandomNumberGenerator } from 'utils';
import AssignedBundleTrainers from './AssignedBundleTrainers';
import AssignedCourseTrainers from './AssignedCourseTrainers';
import MarkDateWiseAbsentModal from './MarkDateWiseAbsentModal';
import SendRequestModal from './SendRequestModal';
import TrainerCard from './TrainerCard';
import TrainerRequestAcceptModal from './TrainerRequestAcceptModal';
import {
  AssignedSession,
  AssignedTrainerCourse,
  IAdminTrainerRequest,
  IForm,
  IFormValue,
  acceptProps,
} from './types';

export const profitIcon = (value: number, t: TFunction<any, undefined>) => {
  if (value > 50) {
    return (
      <label className="rounded-md bg-green-600 inline-flex items-center text-white text-sm font-semibold gap-1 px-2.5 py-1.5 mb-2">
        {t('trainer.profit')}
        <Image
          iconName="arrowRight"
          iconClassName="-rotate-90 w-3 h-3 stroke-[3px]"
        />
      </label>
    );
  }
  if (value < 40) {
    return (
      <label className="rounded-md bg-red-600 inline-flex items-center text-white text-sm font-semibold gap-1 px-2.5 py-1.5 mb-2">
        {t('loss')}
        <Image
          iconName="arrowRight"
          iconClassName="rotate-90 w-3 h-3 stroke-[3px]"
        />
      </label>
    );
  }
  if (value >= 40 && value <= 50) {
    return (
      <label className="rounded-md bg-orange-400 inline-flex items-center text-white text-sm font-semibold gap-1 px-2.5 py-1.5 mb-2">
        {t('breakEven')}
        <Image iconName="transferIcon" iconClassName="w-3 h-3 stroke-[3px]" />
      </label>
    );
  }
  return 'Out of range';
};

const AcceptTrainerAdmin = ({
  slug,
  currentTabTitle,
  courseType,
  courseStatus,
}: acceptProps) => {
  const sendRequestModal = useModal();
  const updateTitle = useTitle();
  const AddAddress = useModal();
  const rejectModal = useModal();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [lumpsumApi] = useAxiosPost();
  const [rejectTrainer] = useAxiosPost();
  const [assignedBundleTrainers] = useAxiosGet();
  const params = useParams();
  const apiUrl = slug
    ? `/course/bundle/trainers/${slug}`
    : `/course/trainers/${params?.slug}`;
  const { response, refetch, isLoading } = useQueryGetFunction(apiUrl);
  const {
    response: assignedTrainerResponse,
    refetch: refetchShowTrainer,
    isLoading: isAssignedTrainerLoading,
  } = useQueryGetFunction(
    `/course/assigned-trainers?getByParentSlug=${slug ?? params?.slug}`
  );

  const markDateWiseAbsentModal = useModal();
  const [isStatusDraft, setIsStatusDraft] = useState(false);
  const [trainerId, setTrainerId] = useState<number | null>(null);
  const [trainer, setTrainer] = useState<IAdminTrainerRequest[]>([]);
  const [isOptional, setIsOptional] = useState<boolean | null>(false);
  const [withoutApproval, setWithoutApproval] = useState<boolean | undefined>(false);
  const [bundleId, setBundleId] = useState<number | null>();
  const [trainerIds, setTrainerIds] = useState<number[]>([]);
  const [showAssignedTrainers, setShowAssignedTrainers] =
    useState<AssignedTrainerCourse>();
  const [showAssignedBundleTrainers, setShowAssignedBundleTrainers] =
    useState<IAssignedBundleTrainer>();

  const initializeSelectedLessons = () => {
    const selectedLessonsMap = new Map<number, string[]>();
    trainer?.forEach((item) => {
      item?.assignedSession.forEach((session) => {
        if (
          session.lessonSessions?.slug &&
          session?.trainer_assigned_to_status !== 'rejected'
        ) {
          if (!selectedLessonsMap.has(item.user.id)) {
            selectedLessonsMap.set(item.user.id, []);
          }
          selectedLessonsMap.get(item.user.id)?.push(session.lessonSessions.slug);
        }
      });
    });
    return Array.from(selectedLessonsMap.entries()).map(
      ([trainerId, lesson_slug]) => ({
        trainerId,
        lesson_slug,
      })
    );
  };

  const [selectedLessons, setSelectedLessons] = useState<
    {
      trainerId: number | undefined;
      lesson_slug: string[];
    }[]
  >([]);

  const initialFormState: IForm = {
    formValues: [
      {
        lumpsum_amount: undefined,
        reimbursement_fee: undefined,
        isLumpsumCheck: false,
      },
    ],
  };

  const [formValue, setFormValue] = useState<IForm>(initialFormState);

  useEffect(() => {
    if (response?.data) {
      setTrainer(response?.data?.data);

      if (response?.data?.data?.length > 0) {
        let newData: IForm = {};
        response?.data?.data?.forEach((data: IAdminTrainerRequest) => {
          newData = {
            ...newData,
            formValues: [
              ...(newData.formValues ?? []),

              {
                lumpsum_amount: data?.amount,
                reimbursement_fee: data?.reimbursement_amount,
                isLumpsumCheck: data?.is_lumpsum_select ?? false,
              },
            ],
          };
        });
        setFormValue(newData);
      }

      const draftStatus = response?.data?.data?.some((item: IAdminTrainerRequest) =>
        item.assignedSession?.some(
          (session) => session.trainer_assigned_to_status === 'draft'
        )
      );
      setIsStatusDraft(draftStatus);
    }
  }, [response]);

  useEffect(() => {
    const initialSelectedLessons = initializeSelectedLessons();
    setSelectedLessons(initialSelectedLessons);
  }, [trainer]);

  useEffect(() => {
    if (assignedTrainerResponse?.data) {
      setShowAssignedTrainers(assignedTrainerResponse?.data?.data?.[0]);
    }
  }, [assignedTrainerResponse]);

  useEffect(() => {
    if (slug) {
      getAssignedTrainersForBundle();
    }
  }, [slug]);

  const onReject = async () => {
    const apiUrl = slug
      ? `/course/bundle/trainers/action/${slug}`
      : `/course/trainers/action/${params?.slug}`;
    const { error } = await rejectTrainer(apiUrl, {
      trainer_id: trainerId,
      action: 'rejected',
    });
    if (!error) {
      rejectModal.closeModal();
      setTrainerId(null);
      refetch();
    }
  };

  const handleOnChangeCheckBox = (
    checkData: React.ChangeEvent<HTMLInputElement>,
    trainerIds: number[]
  ) => {
    const newData = Number(checkData.target.value);
    const isChecked = checkData.target.checked;
    const cloneFormValue = [...trainerIds];
    if (isChecked) {
      cloneFormValue.push(newData);
    } else {
      cloneFormValue.splice(cloneFormValue.indexOf(newData), 1);
    }

    setTrainerIds(cloneFormValue);
  };

  const handleLumpsumFunction = async (trainerId: number, values?: IFormValue) => {
    const apiUrl = slug
      ? `/course/trainers/lump-sump-amount/${slug}`
      : `/course/trainers/lump-sump-amount/${params?.slug}`;
    const temp: { [key: string]: unknown } = {
      trainer_id: trainerId,
      reimbursement_amount: values?.reimbursement_fee,
      amount: values?.lumpsum_amount,
      is_lumpsum_selected: values?.isLumpsumCheck,
    };
    if (slug) {
      temp.bundle = true;
    }
    const { error } = await lumpsumApi(apiUrl, temp);
    if (!error) refetch();
  };

  const getAssignedTrainersForBundle = async () => {
    if (slug) {
      const response = await assignedBundleTrainers(
        `/course/bundle/date-wise-assigned-lesson/${slug}`
      );
      setShowAssignedBundleTrainers(response?.data);
    }
  };

  const markAsButton = (item: {
    user: { id: number };
    assignedSession?: AssignedSession[];
    amount?: number;
    reimbursement_amount?: number;
    is_lumpsum_select?: boolean;
  }) => {
    return (
      <Button
        parentClass="h-fit"
        className="action-button red-btn shrink-0"
        tooltipText={t('MarkAsAbsent.toolTip')}
        onClickHandler={() => {
          setTrainerId(item?.user?.id);
          markDateWiseAbsentModal.openModal();
        }}
      >
        <Image
          iconName="userCrossIcon"
          iconClassName="stroke-current w-5 h-5"
          width={24}
          height={24}
        />
      </Button>
    );
  };

  updateTitle(t('trainerAsItIs'));
  return (
    <>
      {isLoading || isAssignedTrainerLoading ? (
        <div>
          <div className="lazy h-[150px] my-3" />
          <div className="lazy h-[30px] my-3" />
          <div className="lazy h-[150px] my-2" />
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="lazy h-[150px] my-2" />
            ))}
          </div>
        </div>
      ) : (
        ''
      )}
      {!isAssignedTrainerLoading &&
      !isLoading &&
      ((showAssignedTrainers?.main_trainers?.length ?? 0) > 0 ||
        (showAssignedTrainers?.optional_trainers?.length ?? 0) > 0) ? (
        <AssignedCourseTrainers showAssignedTrainers={showAssignedTrainers} />
      ) : (
        ''
      )}
      {showAssignedBundleTrainers &&
        !_.isEmpty(showAssignedBundleTrainers?.filteredSlots) && (
          <AssignedBundleTrainers
            showAssignedBundleTrainers={showAssignedBundleTrainers}
          />
        )}
      {trainer && trainer?.length > 0 && !isAssignedTrainerLoading && !isLoading
        ? trainer?.map((item, index) => {
            const isRequested = item?.assignedSession?.some(
              (session) => session.trainer_assigned_to_status === 'requested'
            );
            const isBundle = item?.assignedSession?.some(
              (session) => !_.isNull(session.course_bundle_id)
            );

            const isConfirmed = item?.assignedSession?.some(
              (session) =>
                session.assigned_to_status === 'accepted' &&
                session.trainer_assigned_to_status === 'accepted'
            );
            const isRejected = item?.assignedSession?.every(
              (session) =>
                session.assigned_to_status === 'rejected' ||
                session.trainer_assigned_to_status === 'rejected'
            );
            const isStatusDraftInside = item?.assignedSession?.some(
              (session) => session.trainer_assigned_to_status === 'draft'
            );
            const showLumpsumField = item?.assignedSession?.some(
              (session) =>
                session?.lesson_session_id === null &&
                session?.trainer_assigned_to_status === 'draft' &&
                session?.is_full_course === true
            );
            const showLumpsumInBundle =
              slug &&
              item?.assignedSession?.some(
                (session) =>
                  session?.lesson_session_id === null &&
                  session?.trainer_assigned_to_status === 'draft'
              );

            let status = '';
            if (isRequested) {
              status = 'requested';
            } else if (isConfirmed) {
              status = 'confirmed';
            } else if (isRejected) {
              status = 'rejected';
            } else {
              status = 'other';
            }
            const renderStatusJSX = () => {
              switch (status) {
                case 'requested':
                  return (
                    <StatusLabel
                      variants="gray"
                      text={t('trainer.pending')}
                      className="h-fit min-h-9"
                    />
                  );
                case 'confirmed':
                  return (
                    <>
                      <StatusLabel
                        variants="completed"
                        text={t('trainer.accepted')}
                        className="h-fit min-h-9"
                      />

                      {isBundle && markAsButton(item)}
                    </>
                  );
                case 'rejected':
                  return (
                    <StatusLabel
                      variants="cancelled"
                      text={t('trainer.rejected')}
                      className="h-fit min-h-9"
                    />
                  );
                default:
                  return <></>;
              }
            };
            const isCheckboxChecked = item?.user?.id
              ? trainerIds?.indexOf(item?.user?.id) > -1
              : false;

            return (
              <>
                {markDateWiseAbsentModal.isOpen && item.user.id === trainerId && (
                  <MarkDateWiseAbsentModal
                    markDateWiseAbsentModal={markDateWiseAbsentModal}
                    slug={slug}
                    item={item}
                    getAssignedTrainersForBundle={getAssignedTrainersForBundle}
                    refetchTrainers={refetch}
                  />
                )}
                <div
                  className="bg-[#F3F3F5] p-5 rounded-xl mb-5"
                  key={`${item?.user?.id}-trainer`}
                >
                  <div className="flex items-center gap-2.5 mb-5">
                    {isStatusDraftInside && (
                      <span className="w-5 h-5 inline-block">
                        <Checkbox
                          value={item?.user?.id}
                          check={isCheckboxChecked}
                          onChange={(checkData) =>
                            handleOnChangeCheckBox(checkData, trainerIds)
                          }
                          labelClass="rounded-md truncate flex-[1_0_0%] capitalize"
                        />
                      </span>
                    )}
                    <div className="max-w-[calc(100%_-_20px)] flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          imgClassName="w-full h-full rounded-full object-cover border border-solid border-borderColor"
                          src={item?.user?.profile_image ?? `/images/no-image.png`}
                          width={32}
                          height={32}
                          alt="Profile Image"
                        />
                      </div>
                      <p className="text-lg font-semibold text-dark">
                        {`${item?.user?.first_name} ${item?.user?.last_name}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      {item.assignedSession.every(
                        (session) =>
                          session.trainer_assigned_to_status !== 'requested'
                      ) &&
                      item?.assignedSession.some(
                        (session) => session.assigned_to_status === 'requested'
                      ) ? (
                        <>
                          <Button
                            onClickHandler={() => {
                              const existingEntry = selectedLessons.find(
                                (entry) => entry.trainerId === item?.user?.id
                              );
                              const isOptionalCheck = item?.assignedSession?.find(
                                (session) =>
                                  (session?.trainer_assigned_to_status ===
                                    'accepted' &&
                                    session?.is_full_course === true &&
                                    session?.lessonSessions === null) ||
                                  (session.course_bundle_id &&
                                    _.isNull(session.course_id))
                              )?.is_optional;
                              if (
                                (existingEntry?.lesson_slug?.length &&
                                  existingEntry?.lesson_slug?.length > 0) ||
                                slug
                              ) {
                                setIsOptional(isOptionalCheck ?? null);
                                setBundleId(
                                  item?.assignedSession?.[0]?.course_bundle_id ??
                                    null
                                );

                                return AddAddress?.openModalWithData?.(item);
                              }

                              dispatch(
                                setToast({
                                  variant: 'Error',
                                  message: t('minimumLesson'),
                                  type: 'error',
                                  id: customRandomNumberGenerator(),
                                })
                              );
                            }}
                            variants="green"
                            className="gap-1"
                          >
                            <Button className="w-5 h-5 rounded-full border-2 border-solid p-[3px] inline-block border-white/50 text-white">
                              <Image
                                iconName="checkIcon"
                                iconClassName="w-full h-full stroke-[2px]"
                              />
                            </Button>
                            {t('CompanyManager.trackCourse.modal.acceptTitle')}
                          </Button>
                          <Button
                            variants="danger"
                            className="gap-1"
                            onClickHandler={() => {
                              setTrainerId(item?.user?.id);
                              rejectModal?.openModal();
                            }}
                          >
                            <Button className="w-5 h-5 rounded-full border-2 border-solid p-1 inline-block border-white/50 text-white">
                              <Image
                                iconName="crossIcon"
                                iconClassName="w-full h-full stroke-[3px]"
                              />
                            </Button>
                            {t('CompanyManager.trackCourse.modal.rejectTitle')}
                          </Button>
                        </>
                      ) : (
                        <>
                          {renderStatusJSX()}
                          {isRequested && !isBundle && (
                            <div>
                              <Button
                                onClickHandler={() => {
                                  const existingEntry = selectedLessons.find(
                                    (entry) => entry.trainerId === item?.user?.id
                                  );
                                  const isOptionalCheck =
                                    item?.assignedSession?.find(
                                      (session) =>
                                        (session?.is_full_course === true &&
                                          session?.lessonSessions === null) ||
                                        (session.course_bundle_id &&
                                          _.isNull(session.course_id))
                                    )?.is_optional;
                                  if (
                                    (existingEntry?.lesson_slug?.length &&
                                      existingEntry?.lesson_slug?.length > 0) ||
                                    slug
                                  ) {
                                    setIsOptional(isOptionalCheck ?? null);
                                    setBundleId(
                                      item?.assignedSession?.[0]?.course_bundle_id ??
                                        null
                                    );
                                    setWithoutApproval(true);

                                    return AddAddress?.openModalWithData?.(item);
                                  }

                                  dispatch(
                                    setToast({
                                      variant: 'Error',
                                      message: t('minimumLesson'),
                                      type: 'error',
                                      id: customRandomNumberGenerator(),
                                    })
                                  );
                                }}
                              >
                                <StatusLabel
                                  variants="primaryFill"
                                  text={t('bypassApproval')}
                                  className="h-fit min-h-9"
                                />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <TrainerCard
                    key={`tCard-${index + 1}`}
                    item={item}
                    index={index}
                    formValue={formValue}
                    handleLumpsumFunction={handleLumpsumFunction}
                    showLumpsumField={showLumpsumField}
                    showLumpsumInBundle={showLumpsumInBundle}
                    profitIcon={profitIcon}
                    selectedLessons={selectedLessons}
                    slug={slug}
                    paramSlug={params?.slug}
                    setSelectedLessons={setSelectedLessons}
                    courseType={courseType}
                    courseStatus={courseStatus}
                    refetch={refetch}
                    refetchShowTrainer={refetchShowTrainer}
                    isRejected={isRejected}
                  />
                </div>
              </>
            );
          })
        : ''}

      {isStatusDraft &&
        (isLoading ? (
          <div className="lazy h-[30px] w-[100px] my-3" />
        ) : (
          <Button
            className="ml-auto"
            onClickHandler={() => {
              if (!_.isEmpty(trainerIds)) {
                sendRequestModal?.openModalWithData?.(trainerIds);
              } else {
                dispatch(
                  setToast({
                    variant: 'Error',
                    message: `${t('trainerError')}`,
                    type: 'error',
                    id: customRandomNumberGenerator(),
                  })
                );
              }
            }}
            variants="primary"
          >
            {t('CourseRequest.sendRequest')}
          </Button>
        ))}
      {!isLoading && response?.data?.data?.length === 0 && (
        <NoDataFound message={t('NoTrainersFound')} />
      )}

      {AddAddress.isOpen && (
        <TrainerRequestAcceptModal
          lessonSlugs={selectedLessons}
          modal={AddAddress}
          course_slug={params?.slug}
          refetch={refetch}
          isOptional={isOptional}
          bundle_slug={slug}
          bundleId={bundleId}
          withoutApproval={withoutApproval}
          refetchShowTrainer={refetchShowTrainer}
          getAssignedTrainersForBundle={getAssignedTrainersForBundle}
        />
      )}
      {sendRequestModal.isOpen && (
        <SendRequestModal
          refetch={refetch}
          params={params}
          modal={sendRequestModal}
          trainerData={trainer}
          currentTabTitle={currentTabTitle}
          setTrainerIds={setTrainerIds}
          bundleSlug={slug}
          courseType={courseType}
          courseStatus={courseStatus}
        />
      )}

      {rejectModal.isOpen && (
        <ConfirmationPopup
          modal={rejectModal}
          bodyText={t('rejectCourse.body')}
          variants="primary"
          confirmButtonText={t('rejectCourse.reject')}
          deleteTitle={t('rejectCourse.title')}
          confirmButtonFunction={onReject}
          confirmButtonVariant="primary"
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            rejectModal.closeModal();
          }}
        />
      )}
    </>
  );
};

export default AcceptTrainerAdmin;
