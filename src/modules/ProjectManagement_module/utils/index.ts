import _ from 'lodash';
import {
  BoardData,
  Cards,
  Columns,
  FindStageArgs,
  UpdateCardType,
  getCardDetailArgs,
} from '../types';

// ** type **
import { ROLES } from 'constants/roleAndPermission.constant';
import { UserModalType } from 'hooks/types';
import { useAxiosGet, useAxiosPatch } from 'hooks/useAxios';
import { AuthUserType } from 'redux-toolkit/slices/authSlice';
import { REACT_APP_API_BASE_URL } from 'config';

/**
 *
 * @return {Columns | Cards}
 *
 */
export const matchId = (
  allData: BoardData,
  findId: number | string,
  type = 'column'
) => {
  let matchingCard: Columns | Cards | undefined = {
    id: 0,
    title: '',
    card_id: 0,
    description: '',
    activity: '',
  };
  if (type === 'column') {
    matchingCard = allData.columns.find((data: Columns) => data.id === findId);
  } else {
    allData.columns.some((data: Columns) => {
      const card = data.cards.find((card: Cards) => card.id === findId);
      if (card) {
        matchingCard = card;
        return true;
      }
      return false;
    });
  }

  return matchingCard;
};

export const closeOnEscape = (modal: UserModalType) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      modal.closeModal();
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  // Cleanup function to remove the event listener when the component unmounts
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};

export function useGetCardDetail() {
  const [getProjectCardDetail, { isLoading }] = useAxiosGet();

  const getCardDetail = async ({
    url,
    card_id,
    modal,
    setInitialBoardCard,
    keyToInsert,
    isModal = false,
  }: getCardDetailArgs) => {
    const resp = await getProjectCardDetail(`${url}${card_id}`);
    if (isModal && !_.isUndefined(modal)) {
      modal?.openModalWithData?.(resp.data);
    } else if (!isModal && setInitialBoardCard && !keyToInsert) {
      setInitialBoardCard(resp?.data);
    } else if (!isModal && setInitialBoardCard && keyToInsert) {
      setInitialBoardCard((prev) => {
        return { ...prev, [keyToInsert]: resp?.data?.[keyToInsert] };
      });
    } else if (isModal && _.isUndefined(modal)) {
      throw new Error('modalArg is compulsory when isModal is true');
    } else {
      throw new Error('Setter method is compulsory when isModal is false');
    }
  };
  return { getCardDetail, isLoading };
}

export const findStage = ({
  destinationStageId,
  sourceStageId,
  initialBoard,
}: FindStageArgs) => {
  const stages = {
    currentStage: '',
    prevStage: '',
  };
  stages.currentStage =
    initialBoard.columns.find((cardStage) => cardStage.id === destinationStageId)
      ?.stageTitle ?? '';
  stages.prevStage =
    initialBoard.columns.find((cardStage) => cardStage.id === sourceStageId)
      ?.stageTitle ?? '';
  return stages;
};

export function useUpdateStage() {
  const [updateCardPatch, { isLoading }] = useAxiosPatch();

  const updateCardStage = async ({
    card_id,
    stageId,
    reason,
    reason_date,
  }: UpdateCardType) => {
    const objToPass: { [key: string]: unknown } = {};
    if (stageId) {
      objToPass.stage_id = stageId;
    }
    if (!_.isEmpty(reason)) {
      objToPass.reason = reason;
    }
    if (reason_date) {
      objToPass.reason_date = reason_date;
    }
    const response = await updateCardPatch(`/cards/stage/${card_id}`, objToPass);
    return response?.error;
  };

  const updateCardOrder = async ({ card_id, orderId }: UpdateCardType) => {
    const response = await updateCardPatch(`/cards/order/${card_id}`, {
      order: orderId,
    });
    return response?.error;
  };
  return { updateCardStage, isLoading, updateCardOrder };
}

type SetCardDataArgs = {
  setInitialBoard?: React.Dispatch<React.SetStateAction<BoardData>>;
  keyToInsert: string;
  initialBoardData: Cards;
  isArray?: boolean;
  updatedData?: unknown;
};

export const setCardData = ({
  setInitialBoard,
  keyToInsert,
  initialBoardData,
  isArray = true,
  updatedData,
}: SetCardDataArgs) => {
  setInitialBoard?.((prev) => {
    const cloneData = JSON.parse(JSON.stringify(prev));
    cloneData?.columns.forEach((data: Columns) => {
      if (!_.isEmpty(data.cards)) {
        const singleCard = data.cards.find(
          (card: Cards) => card.card_id === initialBoardData.id
        );
        if (singleCard) {
          if (isArray) {
            singleCard[keyToInsert] = [
              ...(singleCard[keyToInsert]
                ? (singleCard[keyToInsert] as Array<unknown>)
                : []),
              initialBoardData[keyToInsert],
            ];
          } else {
            singleCard[keyToInsert] = updatedData;
          }
        }
      }
    });
    return cloneData;
  });
};

export const statusLabel = (variant: string) => {
  switch (variant) {
    case 'high':
      return 'text-danger bg-danger/10';
    case 'medium':
      return 'text-orange2 bg-orange2/10';
    case 'low':
      return 'text-green3 bg-green3/10';
    default:
      return 'text-green3 bg-green3/10';
  }
};
type CheckBoxPermission = {
  user: Partial<AuthUserType | null> | undefined;
  cardMember: Cards['card_members'] | undefined;
};
export const handleCheckBoxPermission = ({
  user,
  cardMember,
}: CheckBoxPermission) => {
  if (user) {
    if (user?.role_name === ROLES.Admin) {
      return true;
    }
    if (!_.isEmpty(cardMember)) {
      const isDataPresent = cardMember?.some(
        (data) => data?.member?.id === Number(user?.id)
      );

      return isDataPresent;
    }
    return false;
  }
};

export const handleWheelScroll = (e: Event) => {
  const boardElement = document.querySelector('.react-kanban-board');
  if (boardElement) {
    return (e as unknown as WheelEvent).deltaY;
  }
};

export const OnWheel = () => {
  const boardElement = document.querySelector('.react-kanban-board');

  if (boardElement) {
    boardElement.addEventListener('wheel', handleWheelScroll);
  }

  return () => {
    if (boardElement) {
      boardElement.removeEventListener('wheel', handleWheelScroll);
    }
  };
};

//  Find img tag and replace 'public' with our base url path
export const convertIMG = (content: string) => {
  const parser = new DOMParser();
  const parsedHtml = parser.parseFromString(content, 'text/html');

  // Find all img tags
  const imgTags = parsedHtml.querySelectorAll('img');

  imgTags.forEach((imgTag) => {
    const src = imgTag.getAttribute('src');
    if (src) {
      const updatedSrc = src.replace('/public', `${REACT_APP_API_BASE_URL}/public`);
      imgTag.setAttribute('src', updatedSrc);
    }
  });

  const updatedHtmlString = parsedHtml.documentElement.outerHTML;
  return updatedHtmlString;
};
