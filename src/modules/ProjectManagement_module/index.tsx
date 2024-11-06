import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

// ** components **
import { moveCard, UncontrolledBoard } from '@caldwell619/react-kanban';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import NoDataFound from 'components/NoDataFound';
import PageHeader from 'components/PageHeader/PageHeader';
import ReactKanbanCard from 'components/ReactKanbanCard';
import CustomCardModal from './components/CustomCardModal';

// ** hooks **
import { useAxiosGet } from 'hooks/useAxios';
import { useModal } from 'hooks/useModal';

// ** utils **
import { customRandomNumberGenerator, useDebounce } from 'utils';
import { findStage, useUpdateStage } from './utils';

// ** types **
import {
  BoardData,
  CardInterface,
  Cards,
  CardsProject,
  Columns,
  DragHandleType,
  updateMoveCard,
} from './types';

// ** style **
import './style/index.css';

// ** redux slice **
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { useLanguage } from 'redux-toolkit/slices/languageSlice';
import { socketSelector } from 'redux-toolkit/slices/socketSlice';
import { removeToast, setToast } from 'redux-toolkit/slices/toastSlice';

// ** enum **
import SearchComponent from 'components/Table/search';
import { useTitle } from 'hooks/useTitle';
import { currentFilterState } from 'redux-toolkit/slices/pipelineFilterAssignSlice';
import FilterProjectPipeline from './components/FilterProjectPipeline';
import ReasonModal from './components/ReasonModal';
import { socketProject, StageNameConstant } from './enum';

const ProjectManagement = (props: {
  trainingSpecialistId?: number;
  isViewable?: boolean;
}) => {
  const { trainingSpecialistId, isViewable = false } = props;
  const { t } = useTranslation();

  // Dynamic Title
  const updateTitle = useTitle();
  updateTitle(t('SideNavigation.projectPipeline'));

  const dispatch = useDispatch();
  const socket = useSelector(socketSelector);
  const getLang = useSelector(useLanguage);
  const user = useSelector(getCurrentUser);
  const projectAssign = useSelector(currentFilterState);
  const [cardAssign, setCardAssign] = useState(
    projectAssign?.isFilterAssign ? user?.id : ''
  );
  const isSearchFocusOut = useRef(false);
  let firstCardEmpty = false;

  const allLangs = getLang.allLanguages;
  const currLang = allLangs?.find(
    (item) => item.short_name === getLang.language
  )?.name;

  const isMove = useRef(false);
  const isSocket = useRef(false);

  const reasonModal = useModal();
  const cardModal = useModal();

  const [projectStages, { isLoading }] = useAxiosGet();

  const [getCards, { isLoading: getCardLoader }] = useAxiosGet();
  const { updateCardStage, updateCardOrder } = useUpdateStage();

  const [initialBoard, setInitialBoard] = useState<BoardData>({
    columns: [],
  });
  const [movedCardId, setMovedCardId] = useState<{
    card_id: number;
    stage_id: number;
  }>({ card_id: -1, stage_id: -1 });
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounce(search, 800);
  const initialBoardRef = useRef<BoardData>({ columns: [] });
  const firstRenderEffect = useRef(false);
  const [isCardEmpty, setIsCardEmpty] = useState(false);

  useEffect(() => {
    if (firstRenderEffect.current) {
      isMove.current = false;
      getProjectStages();
    }
    firstRenderEffect.current = true;
  }, [getLang.language]);

  useEffect(() => {
    // if (response?.data?.data?.length > 0) {
    getProjectStages();
    // }
  }, []);

  useEffect(() => {
    if (initialBoard.columns.length > 0 && !isMove.current) {
      getProjectCards();
    }
    if (isSocket.current) {
      initialBoardRef.current = initialBoard;
    }
  }, [initialBoard, debounceSearch]);

  useEffect(() => {
    socket?.on(socketProject.UPDATE_PROJECT_CARD_STAGE, (data) => {
      let foundIndex = -1;
      if (currLang && user?.id !== data.action_by) {
        isMove.current = true;
        isSocket.current = true;
        const initialBoardRefClone = JSON.parse(JSON.stringify(initialBoardRef));
        initialBoardRefClone?.current.columns.some((category: Columns) => {
          foundIndex = category.cards.findIndex(
            (card: Cards) => card.card_id === data.card[currLang]
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

  const getProjectStages = async () => {
    const response = await projectStages('/stages/project-management');
    const initialBoardClone = JSON.parse(JSON.stringify(initialBoard));
    initialBoardClone.columns = [];
    response?.data?.data?.forEach(
      (data: { id: number; order: number; name: string; stage_title: string }) => {
        initialBoardClone.columns.push({
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
    initialBoardRef.current = initialBoardClone;
    setInitialBoard(initialBoardClone);
  };

  const getProjectCards = async (
    cardPriority?: string[],
    dateFilter?: {
      start_date: string;
      end_date: string;
    },
    filterCardAssign = cardAssign,
    membersFilter = []
  ) => {
    const cloneInitialBoard = JSON.parse(JSON.stringify(initialBoardRef.current));

    const objToPass: { [key: string]: unknown } = {};
    if (
      !_.isEmpty(cardPriority) ||
      _.isEmpty(dateFilter?.start_date) ||
      !_.isEmpty(membersFilter) ||
      !_.isEmpty(filterCardAssign) ||
      !_.isEmpty(dateFilter?.end_date) ||
      !firstCardEmpty
    ) {
      isSearchFocusOut.current = true;
      firstCardEmpty = true;
    }
    objToPass.search = !_.isEmpty(debounceSearch) ? debounceSearch : undefined;
    objToPass.priority = !_.isEmpty(cardPriority)
      ? cardPriority?.toString()
      : undefined;
    objToPass.start_date = !_.isEmpty(dateFilter?.start_date)
      ? dateFilter?.start_date
      : undefined;
    objToPass.end_date = !_.isEmpty(dateFilter?.end_date)
      ? dateFilter?.end_date
      : undefined;
    if (membersFilter.length > 0) {
      objToPass.members = membersFilter;
    } else if (filterCardAssign) {
      objToPass.members = trainingSpecialistId ?? filterCardAssign;
    }
    const resp = await getCards('/boards/project-management/cards', {
      params: objToPass,
    });
    const cardData = resp?.data?.data;
    if (!_.isEmpty(cardData)) {
      cardData.forEach((data: CardInterface) => {
        data?.cards?.forEach((card) => {
          if (!_.isUndefined(card.project) && !_.isEmpty(card.project)) {
            const singleStage = cloneInitialBoard.columns.filter(
              (stage: Columns) => stage.id === card.stage_id
            );
            if (isSearchFocusOut.current && singleStage[0]?.cards) {
              cloneInitialBoard.columns.forEach((stage: Columns) => {
                stage.cards = [];
              });
              isSearchFocusOut.current = false;
            }
            card.project.priority = card.priority;
            card.project.card_labels = card.card_labels;
            singleStage[0]?.cards.push(card.project);
          }
        });
      });

      const isEveryCardEmpty = cardData.every((item: CardsProject) => {
        return _.isEmpty(item.cards);
      });
      if (isEveryCardEmpty && (debounceSearch || !_.isEmpty(cardPriority))) {
        initialBoard.columns.forEach((stage) => {
          stage.cards = [];
        });
      } else if (isEveryCardEmpty) {
        setIsCardEmpty(isEveryCardEmpty);
      } else {
        setInitialBoard(cloneInitialBoard);
        initialBoardRef.current = cloneInitialBoard;
        setIsCardEmpty(false);
        isMove.current = true;
      }
    } else {
      setIsCardEmpty(true);
    }
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
        stageName.currentStage === StageNameConstant.ProjectRejected ||
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
      initialBoardRef.current = cloneOldInitialBoard;
    }
  };
  const handleDrag = async (...dragData: DragHandleType) => {
    const cloneOldInitialBoard = JSON.parse(JSON.stringify(initialBoard));
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
    const random = customRandomNumberGenerator();
    if (stageName.currentStage === stageName.prevStage) {
      await updateMoveCard({
        cardId: card.card_id,
        source,
        destination,
        isCardOrder: true,
      });
      return;
    }
    if (
      stageName.prevStage === StageNameConstant.DateConfirmed ||
      stageName.prevStage === StageNameConstant.CourseCompleted ||
      stageName.prevStage === StageNameConstant.ProjectRejected ||
      stageName.prevStage === StageNameConstant.CourseRejected
    ) {
      isMove.current = true;
      setInitialBoard(cloneOldInitialBoard);
      dispatch(
        setToast({
          variant: 'Warning',
          message: `${t('ToastMessage.cardMoveValidateText2')}`,
          type: 'warning',
          id: random,
        })
      );
      setTimeout(() => {
        dispatch(removeToast({ id: random }));
      }, 3000);
      return;
    }
    if (stageName.currentStage === StageNameConstant.DateConfirmed) {
      if (!_.isEmpty(card.project_quotes) && destination?.toColumnId) {
        await updateMoveCard({
          cardId: card.card_id,
          source,
          destination,
        });
      } else if (source && destination && card) {
        isMove.current = true;
        setInitialBoard(cloneOldInitialBoard);
        dispatch(
          setToast({
            variant: 'Warning',
            message: `${t('ToastMessage.cardMoveValidateText')}`,
            type: 'warning',
            id: random,
          })
        );
        setTimeout(() => {
          dispatch(removeToast({ id: random }));
        }, 3000);
      }
    } else {
      await updateMoveCard({
        cardId: card.card_id,
        source,
        destination,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full mt-2.5 bg-white rounded-lg">
        <Image alt={t('ProjectManagement.Main.loaderAltText')} loaderType="Spin" />
      </div>
    );
  }

  return (
    <div>
      {!trainingSpecialistId && (
        <PageHeader text={t('SideNavigation.projectPipeline')} small>
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
                    setSearch('');
                  }}
                  value={search}
                />
                <FilterProjectPipeline
                  getProjectCards={getProjectCards}
                  setCardAssign={setCardAssign}
                  cardAssign={cardAssign}
                />
              </>
            )}
          </div>
        </PageHeader>
      )}
      {/* onMouseOver={(e) => overMouse(e)} */}
      <div className="flex flex-col gap-y-7">
        {isCardEmpty && !isLoading && !getCardLoader ? (
          <CustomCard minimal bodyClass="remove-column-padding">
            <NoDataFound message={t('ProjectManagement.BoardComponent.noCard')} />
          </CustomCard>
        ) : (
          <UncontrolledBoard
            disableColumnDrag
            key={customRandomNumberGenerator()}
            initialBoard={initialBoard}
            disableCardDrag={!!trainingSpecialistId}
            onCardDragEnd={(...dragData) => {
              handleDrag(...(dragData as unknown as DragHandleType));
            }}
            renderCard={(card) => (
              <ReactKanbanCard
                trainingSpecialistId={trainingSpecialistId}
                isOnClick
                cardModal={cardModal}
                cardType="projectCard"
                card={card}
              />
            )}
            renderColumnHeader={({ title, id }) => {
              return (
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
              );
            }}
          />
        )}
      </div>

      {cardModal.isOpen && (
        <CustomCardModal
          isViewable={isViewable}
          isMove={isMove}
          initialBoard={initialBoard}
          CardModal={cardModal}
          getProjectStages={getProjectStages}
          getProjectCards={getProjectCards}
          setInitialBoard={setInitialBoard}
        />
      )}

      {reasonModal.isOpen && (
        <ReasonModal
          modal={reasonModal}
          CardModal={cardModal}
          getProjectStages={getProjectCards}
          movedCardId={movedCardId}
          oldPipeline={initialBoardRef.current}
          setInitialBoard={setInitialBoard}
        />
      )}
    </div>
  );
};

export default ProjectManagement;
