import { Column, UncontrolledBoard, moveCard } from '@caldwell619/react-kanban';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

// ** components **
import CustomCard from 'components/Card';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import PageHeader from 'components/PageHeader/PageHeader';
import ReactKanbanCard from 'components/ReactKanbanCard';
import SearchComponent from 'components/Table/search';
import CustomCardModal from '../components/CustomCardModal';
import FilterCoursePipeline from '../components/FilterCoursePipeline';

// ** hooks **
import { useModal } from 'hooks/useModal';
import { useQueryGetFunction } from 'hooks/useQuery';

// ** utils **
import { customRandomNumberGenerator, useDebounce } from 'utils';
import { findStage, useUpdateStage } from '../utils';

// ** types **
import {
  BoardData,
  Cards,
  CardsProject,
  Columns,
  DragHandleType,
  ICardType,
  IDateType,
  IGetProjectCardArgs,
  IMemberType,
  PaginationCourse,
  updateMoveCard,
} from '../types';

// ** constant **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';

// ** hooks **
import { useAxiosGet } from 'hooks/useAxios';

// ** style **
import '../style/index.css';

// ** redux slice **
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { socketSelector } from 'redux-toolkit/slices/socketSlice';

// ** enum **
import { useTitle } from 'hooks/useTitle';
import {
  getScrollLeft,
  setScrollLeft,
} from 'redux-toolkit/slices/pipelineScrollSlice';
import ReasonModal from '../components/ReasonModal';
import { StageNameConstant, socketProject } from '../enum';

const CoursePipeline = (props: {
  trainingSpecialistId?: number;
  isViewable?: boolean;
}) => {
  const { trainingSpecialistId, isViewable = false } = props;

  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.coursePipeline'));

  const isScroll = useRef(false);

  const dispatch = useDispatch();

  const pipelineScrollY = useSelector(getScrollLeft);
  const socket = useSelector(socketSelector);
  const getLang = useSelector(useLanguage);
  const user = useSelector(getCurrentUser);

  const allLangs = getLang.allLanguages;
  const currLang = allLangs?.find(
    (item) => item.short_name === getLang.language
  )?.name;

  const { state } = useLocation();
  const isMove = useRef(false);
  const isSocket = useRef(false);
  const isSearchFocusOut = useRef(false);
  const currentStage = useRef(-1);
  const { response, isLoading, refetch } = useQueryGetFunction(
    '/stages/course-management'
  );
  const [getCards] = useAxiosGet();
  const { updateCardStage, updateCardOrder } = useUpdateStage();

  const cardModal = useModal();
  const reasonModal = useModal();

  const [initialBoard, setInitialBoard] = useState<BoardData>({
    columns: [],
  });
  const [paginationPipeline, setPaginationPipeline] = useState<
    PaginationCourse[] | []
  >([]);

  const [movedCardId, setMovedCardId] = useState<{
    card_id: number;
    stage_id: number;
  }>({ card_id: -1, stage_id: -1 });
  const initialBoardRef = useRef(initialBoard);
  const [isCardEmpty, setIsCardEmpty] = useState(false);
  const [objToPass, setObjToPass] = useState<{ [key: string]: unknown }>({});

  const [cardType, setCardType] = useState<ICardType>({
    academyCourse: '',
    privateCourse: '',
  });
  const [selectedValue, setSelectedValue] = useState<IMemberType>({
    selectedLabels: [],
    selectedMember: [],
  });
  const [cardAssign, setCardAssign] = useState('');
  const [dateFilters, setDateFilters] = useState<IDateType>({
    start_date: '',
    end_date: '',
  });

  const [search, setSearch] = useState('');
  const debounceSearch = useDebounce(search, 400);
  const firstRenderEffect = useRef(false);
  let firstCardEmpty = false;

  useEffect(() => {
    if (firstRenderEffect.current) {
      isMove.current = false;
      refetch();
    }
    firstRenderEffect.current = true;
  }, [getLang.language]);

  useEffect(() => {
    if (!_.isEmpty(state)) {
      setObjToPass({
        [!_.isEmpty(state) && state.isComingFromDetail
          ? 'cardId'
          : 'ComingProjectId']: !_.isEmpty(state) ? state.cardId : -1,
      });
    }
  }, [state]);

  useEffect(() => {
    if (response?.data?.data?.length > 0) {
      getProjectStages();
    }
  }, [response?.data]);

  useEffect(() => {
    if (initialBoard.columns.length > 0 && !isMove.current) {
      const arr = [];
      if (!_.isEmpty(cardType.privateCourse)) {
        arr.push(cardType.privateCourse);
      }
      if (!_.isEmpty(cardType.academyCourse)) {
        arr.push(cardType.academyCourse);
      }
      const members = [
        ...(selectedValue.selectedMember ?? []),
        ...(cardAssign ? [cardAssign] : []),
      ];
      getProjectCards({
        ...(arr?.length ? { courseType: arr } : {}),
        ...(members?.length ? { membersFilter: members } : {}),
        labelsFilter: selectedValue?.selectedLabels,
        dateFilter: dateFilters,
        isClear: true,
      });
      handleScrollY();
    }
    if (isSocket.current) {
      initialBoardRef.current = initialBoard;
    }
  }, [initialBoard, debounceSearch]);

  useEffect(() => {
    setScrollPos();
  }, [initialBoard, debounceSearch, cardModal]);

  useEffect(() => {
    socket?.on(socketProject.UPDATE_COURSE_CARD_STAGE, (data) => {
      isMove.current = true;
      isSocket.current = true;
      let foundIndex = -1;
      if (currLang && user?.id !== data.action_by) {
        initialBoardRef.current.columns.some((category) => {
          foundIndex = category.cards.findIndex(
            (card) => card.card_id === data.card[currLang]
          );
          return foundIndex !== -1;
        });
        const source = {
          fromPosition: foundIndex,
          fromColumnId: data.lastStage[currLang],
        };
        const destination = {
          toPosition: data.updated_order - 1,
          toColumnId: data.updatedStage[currLang],
        };
        const updatedBoard = moveCard(initialBoardRef.current, source, destination);
        setInitialBoard(updatedBoard);
      }
    });
  }, [socket]);

  const getProjectStages = () => {
    const initialBoardClone = JSON.parse(JSON.stringify(initialBoard));
    initialBoardClone.columns = [];
    response?.data?.data?.forEach(
      (data: { id: number; order: number; name: string; stage_title: string }) => {
        return initialBoardClone.columns.push({
          id: data.id,
          order: data.order,
          title: data.stage_title,
          stageTitle: data.name,
          cards: [],
        });
      }
    );
    initialBoardClone.columns.sort((prev: Columns, curr: Columns) => {
      return Number(prev?.order) - Number(curr?.order);
    });
    setInitialBoard(initialBoardClone);
  };

  const findPaginationPage = (id?: number) => {
    return paginationPipeline.find((item) => item.stage_id === id);
  };

  const setScrollPos = () => {
    const boardElement = document.querySelector('.react-kanban-board');
    if (pipelineScrollY.pipelineScrollLeft) {
      boardElement?.scrollTo({
        left: pipelineScrollY.pipelineScrollLeft,
        behavior: 'smooth',
      });
    }
    if (currentStage.current && currentStage.current !== -1) {
      const ele = document.querySelector(
        `[data-rfd-droppable-id="${currentStage.current}"]`
      );
      const stage = findPaginationPage(currentStage.current);
      ele?.scrollTo({
        top: stage?.scrollFromTop,
      });
    }
  };

  const handleScrollY = () => {
    const boardElement = document.querySelector('.react-kanban-board');
    if (boardElement) {
      if (boardElement.scrollLeft !== pipelineScrollY.pipelineScrollLeft) {
        dispatch(setScrollLeft({ pipelineScrollLeft: boardElement.scrollLeft }));
      }
    }
  };

  const prevState = useRef({
    debounceSearch: '',
    courseType: [] as string[],
    membersFilter: [] as (string | number)[],
    labelsFilter: [] as (string | number)[],
    cardAssign: '',
    dateFilter: { start_date: '', end_date: '' } as IDateType,
  });

  const getProjectCards = async ({
    courseType = [],
    dateFilter,
    labelsFilter = [],
    membersFilter = [],
    stageId,
    isClear,
    isFilterCleared,
  }: IGetProjectCardArgs) => {
    // Get old scrollY position
    handleScrollY();

    const cloneInitialBoard = JSON.parse(JSON.stringify(initialBoard));
    const clonePagination: PaginationCourse[] = JSON.parse(
      JSON.stringify(paginationPipeline)
    );
    const objToPass: { [key: string]: unknown } = {};
    if (
      !_.isEmpty(labelsFilter) ||
      !_.isEmpty(membersFilter) ||
      !_.isEmpty(courseType) ||
      !_.isEmpty(dateFilter?.start_date) ||
      !_.isEmpty(dateFilter?.end_date) ||
      !firstCardEmpty
    ) {
      isSearchFocusOut.current = true;
      firstCardEmpty = true;
    }

    const stagePagination = findPaginationPage(stageId);
    objToPass.project_id = !_.isEmpty(state) ? state.ProjectId : undefined;
    objToPass.search = !_.isEmpty(debounceSearch) ? debounceSearch : undefined;
    objToPass.labels = !_.isEmpty(labelsFilter) ? labelsFilter : undefined;
    objToPass.members = !_.isEmpty(membersFilter)
      ? membersFilter
      : trainingSpecialistId ?? undefined;
    objToPass.course_type = !_.isEmpty(courseType) ? courseType : undefined;
    objToPass.start_date = !_.isEmpty(dateFilter?.start_date)
      ? dateFilter?.start_date
      : undefined;
    objToPass.end_date = !_.isEmpty(dateFilter?.end_date)
      ? dateFilter?.end_date
      : undefined;
    objToPass.stage_id = stagePagination ? stagePagination.stage_id : undefined;
    objToPass.page = stagePagination ? stagePagination.currentPage : undefined;

    const resp = await getCards('/boards/course-management/cards', {
      params: {
        ...objToPass,
        limit: 60,
      },
    });
    const cardData = resp?.data;

    if (!_.isEmpty(cardData)) {
      cardData.forEach((data: CardsProject) => {
        const oldSingleStageData = initialBoard.columns.find(
          (stage: Columns) => stage.id === data.id
        );
        const paginationData = {
          stage_id: data?.id,
          limit: data?.cards?.limit,
          currentPage: data?.cards?.currentPage,
          lastPage: data?.cards?.lastPage,
          count: data?.cards?.count,
        };
        if (clonePagination?.length) {
          const index = clonePagination?.findIndex((i) => i?.stage_id === data?.id); // Find if stage_id is already available in pagination
          // If stage_id is present then replace it with new data
          if (index >= 0) clonePagination[index] = paginationData;
          else clonePagination.push(paginationData); // otherwise add new data
        } else clonePagination.push(paginationData);
        data?.cards?.data?.forEach((card) => {
          if (!_.isEmpty(card.courses) && card.courses) {
            const singleStage = cloneInitialBoard.columns.find(
              (stage: Columns) => stage.id === card.stage_id
            );
            if (isSearchFocusOut.current && singleStage?.cards) {
              cloneInitialBoard.columns.forEach((stage: Columns) => {
                stage.cards = [];
              });
              isSearchFocusOut.current = false;
            }

            card.courses[0].card_labels = card?.card_labels;
            card.courses[0].card_activities = card?.card_activities;
            card.courses[0].card_attachments = card?.card_attachments;
            card.courses[0].slug = card?.slug;

            if (singleStage?.cards) {
              if (!Array.isArray(singleStage.cards)) {
                singleStage.cards = [];
              }

              // Append old and new cards using push
              const oldCards = oldSingleStageData?.cards ?? [];
              const newCards = card.courses ?? [];

              if (
                (debounceSearch &&
                  prevState.current.debounceSearch === debounceSearch) ||
                (_.isEqual(courseType, prevState.current.courseType) &&
                  !_.isEmpty(courseType)) ||
                (_.isEqual(
                  selectedValue.selectedMember,
                  prevState.current.membersFilter
                ) &&
                  !_.isEmpty(selectedValue.selectedMember)) ||
                (_.isEqual(
                  selectedValue.selectedLabels,
                  prevState.current.labelsFilter
                ) &&
                  !_.isEmpty(selectedValue.selectedLabels)) ||
                (cardAssign === prevState.current.cardAssign && cardAssign) ||
                (_.isEqual(
                  dateFilter?.start_date,
                  prevState.current.dateFilter.start_date
                ) &&
                  !_.isEmpty(dateFilter?.start_date)) ||
                (_.isEqual(
                  dateFilter?.end_date,
                  prevState.current.dateFilter.end_date
                ) &&
                  !_.isEmpty(dateFilter?.end_date))
              ) {
                if (!isClear)
                  oldCards.forEach((oldCard) => {
                    singleStage.cards.push(oldCard as unknown as Cards);
                  });
              }

              newCards.forEach((newCard) => {
                singleStage.cards.push(newCard as unknown as Cards);
              });
            }
          }
          // Remove duplicates from singleStage.cards
          cloneInitialBoard.columns.forEach((stage: Columns) => {
            if (stage.cards) {
              stage.cards = stage.cards.filter(
                (card, index, self) =>
                  index === self.findIndex((c) => c.id === card.id)
              );
            }
          });
        });
      });

      const isEveryCardEmpty = cardData.every((item: CardsProject) =>
        _.isEmpty(item.cards.data)
      );
      if (
        isEveryCardEmpty &&
        (debounceSearch ||
          !_.isEmpty(labelsFilter) ||
          !_.isEmpty(membersFilter) ||
          !_.isEmpty(courseType))
      ) {
        initialBoard.columns.forEach((stage) => {
          stage.cards = [];
        });
      } else if (isEveryCardEmpty) {
        setIsCardEmpty(isEveryCardEmpty);
      } else {
        setPaginationPipeline(clonePagination);
        const mergeDataFlag =
          isFilterCleared ||
          debounceSearch ||
          !_.isEmpty(labelsFilter) ||
          !_.isEmpty(membersFilter) ||
          !_.isEmpty(courseType);

        const data = mergeDataFlag
          ? cloneInitialBoard
          : await mergeData(initialBoard, cloneInitialBoard);
        // Remove duplicate cards
        data.columns.forEach((stage: Columns) => {
          if (stage.cards) {
            stage.cards = stage.cards.filter(
              (card, index, self) =>
                index === self.findIndex((c) => c.id === card.id)
            );
          }
        });
        setInitialBoard(data);
        initialBoardRef.current = cloneInitialBoard;
        setIsCardEmpty(false);
        isMove.current = true;
      }
    } else {
      setIsCardEmpty(true);
    }

    prevState.current = {
      debounceSearch,
      courseType,
      labelsFilter: selectedValue.selectedLabels,
      membersFilter: selectedValue.selectedMember,
      cardAssign,
      dateFilter: dateFilters,
    };
  };

  const mergeData = (oldData: BoardData, newData: BoardData) => {
    // Create a copy of the old data to avoid mutating the original array
    const mergedData = { ...oldData };

    const newFunc: Promise<BoardData> = new Promise((resolve) => {
      newData.columns.forEach((newSection) => {
        const matchingSection = mergedData.columns.find(
          (oldSection) => oldSection.id === newSection.id
        );

        if (matchingSection) {
          matchingSection.cards = [...matchingSection.cards, ...newSection.cards];
        } else {
          mergedData.columns.push(newSection);
        }
      });
      resolve(mergedData);
    });
    return newFunc;
  };

  const updateMoveCard = async ({
    source,
    destination,
    cardId,
    isCardOrder = false,
  }: updateMoveCard) => {
    const cloneOldInitialBoard = JSON.parse(JSON.stringify(initialBoard));
    isMove.current = true;
    let res = null;
    const updatedBoard = moveCard(initialBoard, source, destination);
    currentStage.current = Number(source?.fromColumnId);

    setInitialBoard(updatedBoard);

    const stageName = findStage({
      destinationStageId: destination?.toColumnId as number,
      sourceStageId: source?.fromColumnId as number,
      initialBoard,
    });

    if (isCardOrder) {
      let foundIndex = -1;
      (updatedBoard as BoardData).columns.some((category) => {
        foundIndex = category.cards.findIndex((card) => card.card_id === cardId);
        return foundIndex !== -1;
      });
      if (foundIndex !== -1 && cardId) {
        res = await updateCardOrder({
          card_id: cardId,
          orderId: foundIndex + 1,
        });
      }
    } else if (cardId) {
      if (
        stageName.currentStage === StageNameConstant.CourseRejected ||
        stageName.currentStage === StageNameConstant.CoursesStandby
      ) {
        reasonModal?.openModalWithData?.({
          stageName: stageName.currentStage,
        });
        return;
      }
      res = await updateCardStage({
        card_id: cardId,
        stageId: Number(destination?.toColumnId),
      });
    }
    if (!_.isEmpty(res) && !_.isUndefined(res)) {
      setInitialBoard(cloneOldInitialBoard);
    }
  };

  const handleDrag = async (...dragData: DragHandleType) => {
    const card = dragData[1];
    const source = dragData[2];
    const destination = dragData[3];

    const stageName = findStage({
      destinationStageId: destination?.toColumnId as number,
      sourceStageId: source?.fromColumnId as number,
      initialBoard,
    });
    setMovedCardId({
      card_id: card.card_id ?? -1,
      stage_id: Number(destination?.toColumnId),
    });

    if (stageName.currentStage === stageName.prevStage) {
      await updateMoveCard({
        cardId: card.card_id,
        source,
        destination,
        isCardOrder: true,
      });
    } else {
      await updateMoveCard({
        cardId: card.card_id,
        source,
        destination,
      });
    }
  };

  const onFocus = (_e: React.FocusEvent<HTMLDivElement>) => {
    // Your focus logic
  };

  const handleColumnHeader = (column: Column<Cards>) => {
    const { title, id, cards } = column;
    return (
      <>
        <div
          key={id}
          className="kdghiu"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div className="subtitle2 capitalize text-base font-medium text-dark whitespace-pre-wrap">
            {title}
          </div>
        </div>
        {cards.length === 0 && (
          <div className="text-sm text-black/40 font-semibold">
            <div>{t('ProjectManagement.BoardComponent.noCard')}</div>
          </div>
        )}
      </>
    );
  };

  const handleScroll = async (e: Event, id?: string) => {
    const ele = e.target as Element;

    const subtracted = ele.scrollHeight - ele.scrollTop;
    const isAtBottom = parseInt(subtracted.toString(), 10) <= ele.clientHeight;

    const paginationData = findPaginationPage(Number(id));

    if (paginationData) paginationData.scrollFromTop = ele.scrollTop;
    const arr = [];
    if (!_.isEmpty(cardType.privateCourse)) {
      arr.push(cardType.privateCourse);
    }
    if (!_.isEmpty(cardType.academyCourse)) {
      arr.push(cardType.academyCourse);
    }
    if (
      isAtBottom &&
      paginationData?.currentPage &&
      paginationData?.lastPage &&
      paginationData?.currentPage < paginationData?.lastPage
    ) {
      isScroll.current = true;
      paginationData.currentPage += 1;
      setPaginationPipeline((prev) => [...prev, paginationData]);
      const members = [
        ...(selectedValue.selectedMember ?? []),
        ...(cardAssign ? [cardAssign] : []),
      ];
      await getProjectCards({
        stageId: Number(id),
        ...(arr?.length ? { courseType: arr } : {}),
        ...(members?.length ? { membersFilter: members } : {}),
        labelsFilter: selectedValue?.selectedLabels,
        dateFilter: dateFilters,
      });
      isScroll.current = false;
      return true;
    }
    isScroll.current = false;
    return false;
  };

  const overMouse = (e: React.MouseEvent) => {
    if (e?.target && !isScroll.current) {
      const targetEle = e.target as HTMLElement;

      const cls = (targetEle?.offsetParent as HTMLElement)?.dataset?.rfdDraggableId;
      const classOfEle = cls?.split('-');

      if (classOfEle) {
        const ele = document.querySelector(
          `[data-rfd-droppable-id="${classOfEle[classOfEle.length - 1]}"]`
        );
        if (ele) {
          // Add a scroll event listener to continuously check scroll position
          currentStage.current = Number(classOfEle[classOfEle.length - 1]);
          ele.addEventListener('scroll', (e) => {
            if (!isScroll.current) {
              handleScroll(e, classOfEle[classOfEle.length - 1]);
            }
          });

          ele.addEventListener('mouseout', () => {
            ele.removeEventListener('scroll', handleScroll);
          });
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full mt-2.5 bg-white rounded-lg">
        <Image loaderType="Spin" />
      </div>
    );
  }

  return (
    <div>
      {!trainingSpecialistId && (
        <PageHeader
          url={
            !_.isEmpty(state) && state.isComingFromDetail
              ? PRIVATE_NAVIGATION.projectManagementDetails.view.path
              : PRIVATE_NAVIGATION.projectManagement.view.path
          }
          text={
            !_.isEmpty(state)
              ? state.ProjectName
              : !trainingSpecialistId && t('SideNavigation.coursePipeline')
          }
          small
          passState={objToPass}
          showBackButton={!_.isEmpty(state)}
        >
          <div className="flex gap-x-4 items-center justify-center">
            {!trainingSpecialistId && (
              <>
                <SearchComponent
                  placeholder={t('Header.search.placeholder')}
                  onSearch={(e) => {
                    isSearchFocusOut.current = true;
                    isMove.current = false;
                    setSearch(e.target.value);
                  }}
                  onClear={() => {
                    isMove.current = false;
                    setSearch('');
                  }}
                  value={search}
                />

                <FilterCoursePipeline
                  getProjectCards={getProjectCards}
                  cardType={cardType}
                  setCardType={setCardType}
                  selectedValue={selectedValue}
                  setSelectedValue={setSelectedValue}
                  cardAssign={cardAssign}
                  setCardAssign={setCardAssign}
                  dateFilter={dateFilters}
                  setDateFilter={setDateFilters}
                />
              </>
            )}
          </div>
        </PageHeader>
      )}

      <div
        className="flex flex-col gap-y-7 react-kanban-scroll-wrapper"
        onFocus={onFocus}
        onMouseOver={(e) => overMouse(e)}
      >
        {isCardEmpty ? (
          <CustomCard minimal bodyClass="remove-column-padding">
            <NoDataFound message={t('ProjectManagement.BoardComponent.noCard')} />
          </CustomCard>
        ) : (
          <UncontrolledBoard
            disableColumnDrag
            key={customRandomNumberGenerator()}
            disableCardDrag={!!trainingSpecialistId}
            initialBoard={initialBoard}
            onCardDragEnd={(...dragData) =>
              handleDrag(...(dragData as unknown as DragHandleType))
            }
            renderCard={(card) => {
              return <ReactKanbanCard isOnClick cardModal={cardModal} card={card} />;
            }}
            renderColumnHeader={handleColumnHeader}
          />
        )}
      </div>

      {cardModal.isOpen && (
        <CustomCardModal
          isViewable={isViewable}
          initialBoard={initialBoard}
          CardModal={cardModal}
          getProjectStages={refetch}
          isCoursePipeline
          setInitialBoard={setInitialBoard}
          isMove={isMove}
        />
      )}

      {reasonModal.isOpen && (
        <ReasonModal
          modal={reasonModal}
          CardModal={cardModal}
          movedCardId={movedCardId}
          oldPipeline={initialBoardRef.current}
          setInitialBoard={setInitialBoard}
          getProjectStages={refetch}
        />
      )}
    </div>
  );
};
export default CoursePipeline;
