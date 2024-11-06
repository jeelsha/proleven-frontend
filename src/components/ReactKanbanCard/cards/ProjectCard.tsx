import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

// ** components **
import Button from 'components/Button/Button';
import Image from 'components/Image';

// ** type **
import { ProjectCardProps } from '../types';

// ** utils **
import { useGetCardDetail } from 'modules/ProjectManagement_module/utils';

// ** constant **
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';

// ** style **
import { REACT_APP_DATE_FORMAT } from 'config';
import { format, parseISO } from 'date-fns';
import _ from 'lodash';
import '../style/index.css';

const ProjectCard = ({
  card,
  cardModal,
  isOnClick,
  trainingSpecialistId,
}: ProjectCardProps) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const ref = useRef<HTMLDivElement>(null);

  const { state } = useLocation();
  const defaultDueDate =
    card?.due_date &&
    format(parseISO(card?.due_date), REACT_APP_DATE_FORMAT as string);

  useEffect(() => {
    if (state) {
      if (
        Object.hasOwn(state, 'ComingProjectId') &&
        !_.isNull(state.ComingProjectId)
      ) {
        handleOnClick(state.ComingProjectId);
        state.ComingProjectId = null;
      }
      navigate(PRIVATE_NAVIGATION.projectManagement.view.path, {
        replace: true,
        state: null,
      });
    }
  }, [state]);

  const { getCardDetail } = useGetCardDetail();

  const statusLabel = (variant: string) => {
    switch (variant) {
      case 'high':
        return 'text-danger bg-danger/10';
      case 'mid':
        return 'text-orange2 bg-orange2/10';
      case 'low':
        return 'text-green3 bg-green3/10';
      default:
        return 'text-green3 bg-green3/10';
    }
  };

  const handleOnClick = (card_id: number) => {
    if (isOnClick)
      getCardDetail({
        url: '/boards/project-management/card/',
        card_id,
        isModal: true,
        modal: cardModal,
      });
  };

  return (
    <div
      ref={ref}
      className=" single-card mt-2.5 active:scale-[0.95] transition-all duration-300"
    >
      <div
        onClick={() => card && handleOnClick(card.card_id)}
        className="p-4 pt-3 rounded-lg bg-offWhite2 w-[270px] border border-solid border-offWhite"
      >
        <div className="flex flex-col">
          <div
            className={`projectCard-priority-div ${
              card?.priority && statusLabel(card.priority)
            }`}
          >
            {card?.priority && (
              <Button className="w-2 h-2 bg-current inline-block rounded-full" />
            )}
            {card?.priority
              ? `${card?.priority?.charAt(0).toUpperCase()}${card?.priority?.slice(
                  1
                )}`
              : '-'}
          </div>
          {card && (
            <div className="flex flex-col gap-2 mb-2.5 mt-2 ">
              <div className="flex flex-wrap gap-2">
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
              <p className="text-base font-semibold text-dark leading-[1.2] ">
                {card?.title ? card.title : '-'}
              </p>
            </div>
          )}

          <div className="flex gap-1 justify-between">
            <div className="flex gap-2.5 items-center">
              <Button className="text-xs text-dark">
                {t('ProjectManagement.CustomCardModal.dueDate')}
              </Button>
              <p className="flex items-center text-xs leading-8 text-navText gap-0.5">
                <Image iconName="calendarIcon2" iconClassName="w-18px h-18px" />
                {defaultDueDate ?? '-'}
              </p>
            </div>
            <Button
              className="projectCard-detail-arrow"
              onClickHandler={() =>
                navigate(PRIVATE_NAVIGATION.projectManagementDetails.view.path, {
                  state: { cardId: card?.card_id, trainingSpecialistId },
                })
              }
            >
              <Image iconName="arrowRight" iconClassName="" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
