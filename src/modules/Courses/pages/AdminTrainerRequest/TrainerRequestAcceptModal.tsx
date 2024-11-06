// **components**
import Button from 'components/Button/Button';
import CounterModal from 'components/CounterModal/CounterModal';
import { ICounterData } from 'components/CounterModal/types';
import RadioButtonGroup from 'components/FormElement/RadioInput';
import { Option } from 'components/FormElement/types';
import { Modal } from 'components/Modal/Modal';

// **formik**
import { FormikProps, FormikValues } from 'formik';
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';

// **libraries**
import { format } from 'date-fns';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// **types**
import Image from 'components/Image';
import {
  IAdminTrainerRequest,
  IReassignData,
  ReassignPayloadDataProps,
  Resource,
  Room,
  RoomResourceType,
  acceptModalProps,
} from './types';

const TrainerRequestAcceptModal = ({
  modal,
  course_slug,
  refetch,
  isOptional,
  bundle_slug,
  bundleId,
  lessonSlugs,
  withoutApproval,
  refetchShowTrainer,
  getAssignedTrainersForBundle,
}: acceptModalProps) => {
  const [getRoomResource] = useAxiosGet();
  const data = modal?.modalData as IAdminTrainerRequest;
  const [roomResource, setRoomResource] = useState<RoomResourceType>();
  const [selectedCounter, setSelectedCounter] = useState<ICounterData[]>();
  const [optionalResource, setOptionalResource] = useState<ICounterData[]>([]);
  const [reassignGetData, setReassignGetData] = useState<IReassignData>();
  const [leftResources, setLeftResources] = useState<ICounterData[]>();
  const [hashMap, setHashMap] = useState(new Map());
  const [isMatchWarning, setIsMatchWarning] = useState(false);
  const [optionalRoom, setOptionalRoom] = useState<Option[]>([]);
  const [roomId, setRoomId] = useState<string>('');
  const [reassign, setReassign] = useState(false);
  const formikRef = useRef<FormikProps<FormikValues>>();
  const [removedResource, setRemovedResource] = useState<ICounterData>();
  const [acceptTrainer, { isLoading }] = useAxiosPost();
  const [acceptReassignTrainer, { isLoading: ReassignIsLoading }] = useAxiosPost();

  const { t } = useTranslation();

  const initialResources = reassignGetData?.optionalResources?.map((resource) => {
    return {
      title: resource?.title,
      quantity: resource?.totalQty,
      id: resource?.id,
    };
  });

  // useEffect to call get APIs for room and resources
  useEffect(() => {
    if (!_.isNull(isOptional)) {
      getRooms();
    }
    if (isOptional && reassign) {
      getAssignedResources();
    }
  }, [isOptional, reassign]);

  // useEffect to check condition for showing warning
  useEffect(() => {
    const isMatch =
      selectedCounter &&
      selectedCounter?.length > 0 &&
      selectedCounter.some((selectedItem) => {
        return roomResource?.optionalResources?.some(
          (roomItem) =>
            roomItem.id === selectedItem.id &&
            roomItem.totalQty === selectedItem.quantity
        );
      });
    setIsMatchWarning(isMatch ?? false);
  }, [selectedCounter]);

  // useEffect to calculate left resources
  useEffect(() => {
    const cloneData = leftResources && [...leftResources];
    if (hashMap.size > 0) {
      const cloneInitialValue = initialResources && [...initialResources];

      hashMap.forEach((value) => {
        const updatedData = JSON.parse(JSON.stringify(value)).map(
          (data: ICounterData) => {
            const obj = cloneInitialValue?.find((res) => res.id === data.id);

            if (obj) {
              obj.quantity -= data.quantity;
            }
            return obj;
          }
        );
        (updatedData ?? []).forEach((value: ICounterData) => {
          const index = cloneData?.findIndex((obj) => obj.id === value.id);
          if (index !== -1 && cloneData) {
            cloneData[index as number] = value;
          }
        });
      });
      setLeftResources(cloneData);
    } else if (reassignGetData) {
      const tempResource = reassignGetData?.optionalResources?.map((resource) => {
        return {
          title: resource?.title,
          quantity: resource?.totalQty,
          id: resource?.id,
        };
      });
      if (tempResource) setLeftResources(tempResource);
    }
    if (removedResource && cloneData) {
      const totalQty = reassignGetData?.optionalResources?.find(
        (res) => res.id === removedResource.id
      )?.totalQty;
      const findIndex = cloneData?.findIndex((obj) => obj.id === removedResource.id);
      if (findIndex !== -1) {
        cloneData[findIndex].quantity =
          removedResource.quantity === 0
            ? (totalQty as number)
            : removedResource.quantity;

        setRemovedResource(undefined);
      }
      setLeftResources(cloneData);
    }
  }, [hashMap, reassignGetData]);

  // on submit function
  const handleSubmit = async () => {
    const resources = roomResource?.mainResources?.map((item) => {
      return { id: item?.id, qty: item?.totalQty };
    });
    let temp: {
      trainer_id?: number;
      action?: string;
      resources?: { id: number; qty: number }[];
      course_room_id?: number;
      lesson_session_slugs?: string[];
      profit?: number;
      without_approval?: boolean;
    } = {};
    temp = {
      trainer_id: data?.user?.id,
      action: 'accepted',
      profit: data?.user?.profit,
    };
    if (isOptional === false) {
      if (!_.isEmpty(resources)) temp.resources = resources;
      if (roomResource?.mainRooms) {
        temp.course_room_id = roomResource?.mainRooms[0]?.id;
      }
    }
    if (isOptional === true) {
      const filteredResources = selectedCounter?.map((item) => {
        return { id: item?.id, qty: item?.quantity };
      });
      temp.resources = filteredResources;
      if (Number(roomId) > 0) {
        temp.course_room_id = Number(roomId);
      }
    }
    if (lessonSlugs) {
      const existingEntry = lessonSlugs.find(
        (entry) => entry.trainerId === data?.user?.id
      );

      temp.lesson_session_slugs = existingEntry?.lesson_slug;
    }
    if (withoutApproval) temp.without_approval = true;
    if (isOptional && reassign) {
      reassignPostData();
    } else {
      const apiUrl = bundle_slug
        ? `/course/bundle/trainers/action/${bundle_slug}`
        : `/course/trainers/action/${course_slug}`;
      const { error } = await acceptTrainer(apiUrl, temp);
      if (!error) {
        modal.closeModal();
        refetch?.();
        refetchShowTrainer?.();
        getAssignedTrainersForBundle?.();
      }
    }
  };

  // submit reassign data
  const reassignPostData = async () => {
    const reassignPayloadData: ReassignPayloadDataProps = {
      reassigned_resources: [],
      trainer_id: 0,
      profit: data?.user?.profit,
    };
    hashMap.forEach((value, key) => {
      const modifiedValue = JSON.parse(JSON.stringify(value))?.map(
        (item: { id: number; quantity: number }) => {
          return {
            id: item?.id,
            qty: item?.quantity,
          };
        }
      );
      reassignPayloadData.reassigned_resources.push({
        trainer_id: key,
        resources: modifiedValue,
      });
    });
    if (reassignPayloadData.course_room_id && roomId) {
      reassignPayloadData.course_room_id = Number(roomId);
    } else if (!roomId) {
      delete reassignPayloadData.course_room_id;
    }
    reassignPayloadData.trainer_id = data?.user?.id;
    if (lessonSlugs) {
      const existingEntry = lessonSlugs.find(
        (entry) => entry.trainerId === data?.user?.id
      );

      reassignPayloadData.lesson_session_slugs = existingEntry?.lesson_slug;
    }
    if (withoutApproval) reassignPayloadData.without_approval = true;

    const apiUrl = bundle_slug
      ? `/course/bundle/trainers/reassign/rooms-resources/${bundle_slug}`
      : `/course/trainers/reassign/rooms-resources/${course_slug}`;
    const { error } = await acceptReassignTrainer(apiUrl, reassignPayloadData);
    if (!error) {
      modal.closeModal();
      refetch?.();
      refetchShowTrainer?.();
      getAssignedTrainersForBundle?.();
    }
  };

  const getRooms = async () => {
    const apiUrl = bundle_slug
      ? `/course/bundle/rooms-resources?course_bundle_id=${bundleId}`
      : `/course/rooms-resources?course_slug=${course_slug}&trainer_id=${data?.user?.id}`;
    const resp = await getRoomResource(apiUrl, {
      params: {
        is_optional: isOptional,
      },
    });
    if (resp?.data) {
      setRoomResource(resp?.data);
      const option = resp?.data?.optionalResources
        ?.filter((data: Resource) => data.totalQty - data.usedQty !== 0)
        ?.map((res: Resource) => {
          return {
            id: res.id,
            quantity: res.totalQty - res.usedQty,
            title: res.title,
          };
        });
      setOptionalResource(option);
      const optionalRoom = resp?.data?.optionalRoom?.map((room: Room) => {
        return {
          label: room?.title,
          value: room?.id,
        };
      });
      setOptionalRoom(optionalRoom);
    }
  };

  const getAssignedResources = async () => {
    const apiUrl = bundle_slug
      ? `/course/bundle/trainers/assigned/rooms-resources/${bundle_slug}?trainer_id=${data?.user?.id}`
      : `/course/trainers/assigned/rooms-resources/${course_slug}?trainer_id=${data?.user?.id}`;
    const resp = await getRoomResource(apiUrl);
    if (resp?.data) {
      setReassignGetData(resp?.data);
    }
  };

  const renderActionButtons = () => (
    <div className="flex justify-end gap-4 mt-5">
      <Button
        className="min-w-[110px]"
        variants="whiteBordered"
        onClickHandler={() => modal.closeModal()}
      >
        {t('Button.cancelButton')}
      </Button>
      <Button
        className="min-w-[110px]"
        variants="primary"
        type="submit"
        isLoading={isLoading || ReassignIsLoading}
        disabled={isLoading || ReassignIsLoading}
        onClickHandler={() => {
          if (formikRef.current) {
            formikRef.current?.submitForm();
          }

          handleSubmit();
        }}
      >
        {t('Button.saveButton')}
      </Button>
    </div>
  );

  const renderMainTrainerUI = () => {
    return (
      <>
        {((roomResource?.mainRooms && roomResource?.mainRooms?.length > 0) ||
          (roomResource?.mainResources &&
            roomResource?.mainResources?.length > 0)) && (
          <div className="my-6 table border border-solid border-gray-200 table-fixed border-collapse w-full">
            {roomResource?.mainRooms && roomResource?.mainRooms?.length > 0 && (
              <div className="table-row">
                <div className="table-cell border border-solid border-gray-200 p-2">
                  <Button className="text-sm font-bold text-dark">
                    {t('CourseBundle.trainer.room')}
                  </Button>
                </div>
                <div className="table-cell border border-solid border-gray-200 p-2">
                  {roomResource?.mainRooms &&
                    roomResource?.mainRooms?.length > 0 && (
                      <ul
                        className={`flex flex-col gap-y-1.5 ${
                          roomResource?.mainRooms?.length > 1 && ' list-disc ps-5'
                        }`}
                      >
                        {roomResource?.mainRooms?.map((item, index) => (
                          <li className="leading-none" key={item?.id}>
                            <Button
                              className="text-sm font-medium text-dark"
                              key={`rooms_${index + 1}`}
                            >
                              {item?.title}&nbsp;
                              {item?.totalQty &&
                                `(${t('trainerRequestAcceptModal.RoomTitle')}: ${
                                  item.totalQty
                                })`}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              </div>
            )}

            {roomResource?.mainResources &&
              roomResource?.mainResources?.length > 0 && (
                <div className="table-row">
                  <div className="table-cell border border-solid border-gray-200 p-2">
                    <Button className="text-sm font-bold text-dark">
                      {t('Calendar.eventDetails.resourceTitle')}
                    </Button>
                  </div>
                  <div className="table-cell border border-solid border-gray-200 p-2">
                    {roomResource?.mainResources &&
                      roomResource?.mainResources?.length > 0 && (
                        <ul
                          className={`flex flex-col gap-y-1.5 ${
                            roomResource?.mainResources?.length > 1 &&
                            ' list-disc ps-5'
                          }`}
                        >
                          {roomResource?.mainResources?.map((item, index) => (
                            <li className="leading-none" key={item?.id}>
                              <Button
                                className="text-sm font-medium text-dark"
                                key={`resource_${index + 1}`}
                              >
                                {item?.title}&nbsp;
                                {item?.totalQty
                                  ? `(${t(
                                      'trainerRequestAcceptModal.QuantityTitle'
                                    )}: ${item.totalQty})`
                                  : ''}
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>
              )}
          </div>
        )}
        {data?.assignedSession?.map((item, index) => {
          return item?.selected_user?.assignedToUser?.id ? (
            <div
              key={`accept-${index + 1}`}
              className="p-4 border border-solid border-gray-200 rounded-[6px] mb-2 bg-[rgba(244,244,246,0.5)]"
            >
              <div className="text-[14px]">
                <p>
                  <strong className="text-primary">Lesson Name:</strong>{' '}
                  {item?.lessonSessions?.lesson?.title}
                </p>
                <p>
                  {' '}
                  <strong className="text-primary">Assigned To: </strong>
                  {item?.selected_user?.assignedToUser?.first_name}
                </p>
                {item?.lessonSessions !== null && (
                  <p className="text-sm leading-4 text-dark flex items-center mt-2">
                    <Button className="w-[18px] h-[18px] inline-block me-1.5 opacity-50">
                      <Image iconName="clockIcon" iconClassName="w-full h-full" />
                    </Button>
                    {item?.lessonSessions?.start_time
                      ? `${format(
                          new Date(item?.lessonSessions?.start_time),
                          'hh:mm a'
                        )}`
                      : ''}
                    -
                    {item?.lessonSessions?.end_time
                      ? `${format(
                          new Date(item?.lessonSessions?.end_time),
                          'hh:mm a'
                        )}`
                      : ''}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <></>
          );
        })}
      </>
    );
  };

  return (
    <Modal
      headerTitle={t('AcceptTrainer')}
      modal={modal}
      width={`${isOptional === null ? 'max-w-[430px]' : 'max-w-[600px]'} `}
    >
      <>
        {roomResource?.isResourceAvaliableForEachTrainer !== false && (
          <p
            className="text-base mb-4"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: t('TrainerAccept.body', {
                NAME: data?.user?.first_name,
                TRAINER:
                  isOptional === true
                    ? t('OptionalTrainer')
                    : isOptional === false
                    ? t('MainTrainer')
                    : t('ExtraTrainer'),
              }),
            }}
          />
        )}

        {isOptional === false && !_.isEmpty(roomResource)
          ? renderMainTrainerUI()
          : ''}

        {isOptional &&
        (roomResource?.totalOptionalResources !== undefined ||
          roomResource?.totalOptionalResources === 0) &&
        roomResource?.isResourceAvaliableForEachTrainer === false ? (
          <p
            className="text-base mb-6"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: t('TrainerAccept.body', {
                NAME: data?.user?.first_name,
                TRAINER:
                  isOptional === true
                    ? t('OptionalTrainer')
                    : isOptional === false
                    ? t('MainTrainer')
                    : t('ExtraTrainer'),
              }),
            }}
          />
        ) : (
          ''
        )}
        {isOptional === true &&
        roomResource?.isResourceAvaliableForEachTrainer &&
        roomResource?.optionalResources?.some(
          (item) => item.totalQty - item.usedQty > 0
        ) ? (
          <>
            <div className="p-2 border border-solid border-dark/10 rounded-lg mb-2">
              <p className="font-medium mb-2">
                {t('trainerRequestAcceptModal.ResourceTitle')}
              </p>
              {roomResource?.optionalResources?.length > 0 && (
                <CounterModal
                  setSelectedCounter={setSelectedCounter}
                  selectedData={selectedCounter}
                  isCheckBox
                  counterData={optionalResource}
                  formikRef={formikRef}
                  isDataOnChange
                />
              )}
            </div>
            {!_.isEmpty(roomResource?.optionalRoom) && (
              <div className="p-2 border border-solid border-dark/10 rounded-lg mb-2">
                <p className="font-medium mb-2">
                  {t('trainerRequestAcceptModal.RoomTitle')}
                </p>
                {roomResource?.optionalRoom && (
                  <RadioButtonGroup
                    optionWrapper="flex flex-col gap-y-2"
                    options={optionalRoom}
                    setSelectedValue={(e) => {
                      if (e) {
                        setRoomId(e);
                      }
                    }}
                    selectedValue={roomId}
                  />
                )}
              </div>
            )}
            {isMatchWarning && (
              <div className="bg-orange-500/15 text-orange-500 border border-solid border-orange-500/50 text-sm font-medium px-4 py-4 rounded-lg mb-2">
                {t('trainerRequestAcceptModal.Warning')}
              </div>
            )}
          </>
        ) : (
          !reassign &&
          isOptional === true &&
          roomResource?.isResourceAvaliableForEachTrainer && (
            <div className="flex flex-col justify-center items-center text-lg">
              <div className="bg-red-500/15 text-red-500 border border-solid border-red-500/50 text-sm font-medium px-4 py-4 rounded-lg mb-2">
                <p>{t('trainerRequestAcceptModal.NoResourceFound')}</p>
              </div>
              <Button
                className="min-w-[110px] mt-2"
                variants="primary"
                type="submit"
                onClickHandler={() => {
                  setReassign(true);
                }}
              >
                {t('trainerRequestAcceptModal.ReassignTitle')}
              </Button>
            </div>
          )
        )}
        {reassign &&
          reassignGetData?.trainerRoomAndUsers?.map((item, index) => {
            return (
              <div
                className="p-2 border border-solid border-dark/10 rounded-lg mb-2"
                key={`trainer_${index + 1}`}
              >
                {(item?.resources?.length > 0 ||
                  data?.user?.id === item?.assignedTo?.id) && (
                  <p className="font-medium mb-2">{item?.assignedTo?.first_name}</p>
                )}
                {item?.resources?.length > 0 ? (
                  <div className="mb-4">
                    <CounterModal
                      setSelectedCounter={(resourcesData) => {
                        setHashMap(
                          new Map(hashMap.set(item?.assignedTo?.id, resourcesData))
                        );
                      }}
                      selectedData={hashMap.get(item.assignedTo.id)}
                      isCheckBox
                      counterData={leftResources ?? []}
                      formikRef={formikRef}
                      isDataOnChange
                      setRemovedResource={setRemovedResource}
                      isPassingUpdatedData
                    />
                  </div>
                ) : (
                  data?.user?.id === item?.assignedTo?.id && (
                    <>
                      <CounterModal
                        setSelectedCounter={(resourcesData) => {
                          setHashMap(
                            new Map(hashMap.set(item?.assignedTo?.id, resourcesData))
                          );
                        }}
                        selectedData={hashMap.get(item.assignedTo.id)}
                        isCheckBox
                        counterData={leftResources ?? []}
                        formikRef={formikRef}
                        isDataOnChange
                        setRemovedResource={setRemovedResource}
                        isPassingUpdatedData
                      />
                      <div>
                        {reassignGetData?.optionalRoom && (
                          <p>{t('trainerRequestAcceptModal.RoomTitle')}</p>
                        )}
                        {reassignGetData?.optionalRoom &&
                          data?.user?.id === item?.assignedTo?.id && (
                            <RadioButtonGroup
                              options={optionalRoom}
                              setSelectedValue={(e) => {
                                if (e) {
                                  setRoomId(e);
                                }
                              }}
                              selectedValue={roomId}
                            />
                          )}
                      </div>
                    </>
                  )
                )}
              </div>
            );
          })}
        {data?.user?.override && (
          <p className="text-orange-600">
            {t('override.trainerText', {
              NAME: `${data?.user?.first_name} ${data?.user?.last_name}`,
            })}
          </p>
        )}
        {(isOptional === false ||
          isOptional === null ||
          (isOptional &&
            roomResource?.optionalResources?.some(
              (item) => item.totalQty - item.usedQty !== 0
            )) ||
          (reassign && roomResource?.isResourceAvaliableForEachTrainer) ||
          (roomResource?.totalOptionalResources !== undefined &&
            roomResource?.totalOptionalResources === 0) ||
          (roomResource?.isResourceAvaliableForEachTrainer === false &&
            roomResource?.totalOptionalResources !== undefined &&
            roomResource?.totalOptionalResources > 0)) &&
          renderActionButtons()}
      </>
    </Modal>
  );
};

export default TrainerRequestAcceptModal;
