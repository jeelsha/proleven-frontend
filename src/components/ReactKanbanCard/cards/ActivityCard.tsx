// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';

// ** utils **
import _ from 'lodash';
import { useGetCardDetail } from 'modules/ProjectManagement_module/utils';

// ** types **
import { ActivityCardProps } from '../types';

// ** Constants **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';

// ** Hooks **
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// ** style **
import '../style/index.css';

const ActivityCard = ({ card, cardModal, isOnClick }: ActivityCardProps) => {
  const { getCardDetail } = useGetCardDetail();

  const { state } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!_.isEmpty(state)) {
      if (Object.hasOwn(state, 'course_cardId') && !_.isNull(state.course_cardId)) {
        handleOnClick(state.course_cardId);

        state.course_cardId = null;
        navigate(PRIVATE_NAVIGATION.coursePipeline.view.path, {
          replace: true,
          state: null,
        });
      }
    }
  }, [state]);

  const handleOnClick = (card_id: number) => {
    if (isOnClick)
      getCardDetail({
        url: '/boards/course-management/card/',
        card_id,
        isModal: true,
        modal: cardModal,
      });
  };

  return (
    <div className="mt-2.5 active:scale-[0.95] transition-all duration-300">
      <div
        onClick={() => card && handleOnClick(card.card_id)}
        className="w-[270px] rounded-lg bg-offWhite2 border border-solid border-offWhite"
      >
        {card?.image && !_.isEmpty(card?.image) && (
          <div className="h-[150px] w-full mb-3">
            <Image
              src={card?.image}
              imgClassName="w-full h-full object-cover rounded-t-md"
              width={350}
              height={150}
              serverPath
            />
          </div>
        )}
        <div className="px-4 flex flex-col gap-2 mb-2.5 mt-2 ">
          <div className=" flex flex-wrap gap-2">
            {card?.card_labels &&
              !_.isEmpty(card?.card_labels) &&
              card?.card_labels?.map((item) => (
                <Button
                  key={item.id}
                  small
                  className="text activityCard-label"
                  customStyle={{
                    backgroundColor: item.label.color,
                    color: '#FFFFFF',
                  }}
                >
                  {item?.label?.title}
                </Button>
              ))}
          </div>
          <p className="text-sm text-dark font-medium">
            {card?.title} {card?.projects ? `(${card?.projects?.title})` : ''}
          </p>
        </div>
        {card && card.description && (
          <div className="text-sm font-medium leading-4 px-4 mb-7">
            <span>{card && card.description}</span>
          </div>
        )}
        <div className="flex gap-3 px-4 pb-4 items-center">
          <div className="h-fit text-navText flex items-center gap-1">
            <div className="w-4 h-4 text-current">
              <Image iconName="lineMenuIcon" iconClassName="w-full h-full" />
            </div>
          </div>
          <div className="h-fit text-navText flex items-center gap-1">
            {card && card?.card_activities && (
              <>
                <div className="w-4 h-4 text-current">
                  <Image iconName="chatBubbleIcon" iconClassName="w-full h-full" />
                </div>
                <span className="text-xs leading-4 font-medium">
                  {card?.card_activities?.length}
                </span>
              </>
            )}
          </div>
          <div className="h-fit text-navText flex items-center gap-1">
            {card && card?.card_attachments && (
              <>
                <div className="w-4 h-4 text-current">
                  <Image iconName="linkIcon" iconClassName="w-full h-full" />
                </div>
                <span className="text-xs leading-4 font-medium">
                  {card?.card_attachments?.length}
                </span>
              </>
            )}
          </div>
          {card && (
            <Button
              small
              variants={`${card?.type === 'private' ? 'primary' : 'secondary'}`}
              className="text capitalize ms-auto activityCard-label categoryActivityCard-label"
            >
              {`${card?.type?.charAt(0).toUpperCase()}${card?.type?.slice(1)}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
