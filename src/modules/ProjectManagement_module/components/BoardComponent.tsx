import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

// ** component **
import { Column, UncontrolledBoard } from '@caldwell619/react-kanban';
import Button from 'components/Button/Button';
import { ConfirmationPopup } from 'components/Modal/ConfirmationPopup';
import CustomColumnModal from './CustomColumnModal';

// ** constant **
import { imageExtension } from 'constants/filesupport.constant';

// ** custom hook **
import { UserModalType } from 'hooks/types';
import { useModal } from 'hooks/useModal';

// ** utils **
import { customRandomNumberGenerator } from 'utils';

// ** redux **

// ** type **
import Image from 'components/Image';
import { setBoardData } from 'redux-toolkit/slices/boardDataSlice';
import { ActiveCardType, BoardData, Cards, Columns } from '../types';

const BoardComponent = (props: {
  allBoardData: BoardData;
  modal: UserModalType;
}) => {
  const { allBoardData, modal } = props;

  const { t } = useTranslation();

  const dispatch = useDispatch();

  const deleteModal = useModal();
  const addColumnModal = useModal();

  const [keyData, setKeyData] = useState<number>(customRandomNumberGenerator());
  const [activeCard, setActiveCard] = useState<ActiveCardType>({
    column: 0,
    card: 0,
  });

  // useEffect(() => {
  //   const ele = document.getElementsByClassName('react-kanban-column');
  //   const array = Array.from(ele);

  //   if (array) {
  //     array.map((data: any) => {
  //       data.children[1]?.appendChild(data.firstChild.lastChild);
  //       return true;
  //     });
  //   }
  // }, [keyData]);

  const handleDeleteColumn = () => {
    const remainingData = allBoardData.columns.filter(
      (data) => data.id !== activeCard.column
    );
    setKeyData(customRandomNumberGenerator());

    dispatch(setBoardData({ columns: [...remainingData] }));

    deleteModal.closeModal();
  };

  const handleDeleteCard = () => {
    const updatedColumns = allBoardData.columns.map((data: Columns) => {
      // If the matching card is found, remove it from the cards array
      return {
        ...data,
        cards: data.cards.filter((card: Cards) => card.id !== activeCard.card),
      };
    });
    setKeyData(customRandomNumberGenerator());
    dispatch(setBoardData({ columns: [...updatedColumns] }));
    deleteModal.closeModal();
  };

  const handleOpenEditModal = (id: number | string) => {
    setActiveCard({
      column: 0,
      card: id,
    });
    modal.openModal();
  };

  // Add column
  const customColumnAdder = () => {
    return (
      <div className="react-kanban-column_add-column">
        <Button
          className="flex font-medium items-center justify-center gap-2 w-full"
          onClickHandler={() => {
            setActiveCard({
              column: 0,
              card: 0,
            });
            addColumnModal.openModal();
          }}
        >
          <span className="w-5 h-5 block">
            <Image iconName="plusIcon" />
          </span>
          {t('ProjectManagement.BoardComponent.addColumn')}
        </Button>
      </div>
    );
  };

  const handleColumnHeader = (column: Column<Cards>) => {
    const { title, id, cards } = column;
    return (
      <>
        <div
          className="kdghiu"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div className="subtitle2 capitalize">{title}</div>
          <div className="relative group">
            <Button className="w-5 h-5">
              <Image iconName="threeDotVerticalIcon" />
            </Button>
            <div className="header_column_div">
              <div className="">
                <Button
                  className="header_column_edit_button"
                  onClickHandler={() => {
                    setActiveCard({
                      column: id,
                      card: 0,
                    });
                    addColumnModal.openModal();
                  }}
                >
                  {t('ProjectManagement.BoardComponent.edit')}
                </Button>
              </div>
              <div className="" key={id}>
                <Button
                  onClickHandler={() => {
                    setActiveCard({
                      column: id,
                      card: 0,
                    });
                    deleteModal.openModal();
                  }}
                  className="header_column_remove_button"
                >
                  {t('ProjectManagement.BoardComponent.remove')}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {cards.length === 0 && (
          <div className="text-sm text-black/40 font-semibold">
            <div>{t('ProjectManagement.BoardComponent.noCard')}</div>
          </div>
        )}
        <div className={` mt-${cards.length === 0 ? '12' : '5'}`} id="add">
          <Button
            type="button"
            className="deleteFile inline-flex items-center justify-center text-emerald-500 font-medium gap-1 footer_column_addCard_button"
            onClickHandler={() => {
              setActiveCard({
                column: id,
                card: 0,
              });
              modal.openModal();
            }}
          >
            <span className="w-5 h-5 block">
              <Image iconName="plusIcon" />
            </span>
            {t('ProjectManagement.BoardComponent.addCard')}
          </Button>
        </div>
      </>
    );
  };

  const handleRenderCard = ({
    title,
    id,
    document,
    labels,
  }: {
    title: string;
    id: number;
    document?: any;
    labels?: any;
  }) => {
    let displayImage = [];
    if (document.attachments.length !== 0) {
      const typeOfAttachments = document.attachments.map((data: any) => {
        const extension = `.${data.name.split('.')[1]}`;
        return imageExtension.includes(extension) && data.name;
      });
      displayImage = typeOfAttachments.filter((val: string) => val);
    }
    let label = [];
    if (labels.length !== 0) {
      label = labels.map((data: string) => Object.keys(data));
    }
    return (
      <div
        className="react_kanban_card"
        key={id}
        onClick={() => handleOpenEditModal(id)}
      >
        <div className="react_kanban_card-inner">
          {displayImage.length !== 0 && (
            <div className="react_kanban_card-image ">
              <img
                src={`/${displayImage[0]}`}
                className="w-full h-full object-cover rounded-t-md"
                width={350}
                height={150}
                alt=""
              />
            </div>
          )}
          <div>
            <div className="react_kanban_card-labels my-4">
              {label.map((data: string) => {
                return (
                  <span
                    className="react_kanban_card-label"
                    key={customRandomNumberGenerator()}
                  >
                    {data}
                  </span>
                );
              })}
            </div>
            <div className="react_kanban_card-text">
              <span>{title}</span>
            </div>
            <div className="flex gap-3 px-4 pb-4">
              <div className="h-fit text-grayText flex items-center gap-1 relative group">
                <Button className="w-4 h-4 text-dark">
                  <Image iconName="lineMenuIcon" iconClassName="w-full h-full" />
                </Button>
                <div className="header_column_div">
                  <div className="h-fit text-grayText flex items-center gap-1">
                    <Button
                      onClickHandler={(e) => {
                        e.stopPropagation();
                        setActiveCard({
                          column: 0,
                          card: id,
                        });
                        deleteModal.openModal();
                      }}
                      className="header_column_remove_button"
                    >
                      {t('ProjectManagement.BoardComponent.remove')}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="h-fit text-grayText flex items-center gap-1">
                <Button className="w-4 h-4 text-dark">
                  <Image iconName="chatBubbleIcon" iconClassName="w-full h-full" />
                </Button>
                <span className="text-xs leading-4 font-medium">1</span>
              </div>
              <div className="h-fit text-grayText flex items-center gap-1">
                <Button className="w-4 h-4 text-dark">
                  <Image iconName="linkIcon" iconClassName="w-full h-full" />
                </Button>
                <span className="text-xs leading-4 font-medium">
                  {document.attachments.length !== 0
                    ? document.attachments.length
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {addColumnModal?.isOpen && (
        <CustomColumnModal
          setKeyData={setKeyData}
          modal={addColumnModal}
          columnId={activeCard}
        />
      )}
      {deleteModal.isOpen && (
        <ConfirmationPopup
          modal={deleteModal}
          bodyText={
            activeCard.column !== 0
              ? t('ProjectManagement.DeleteModal.deleteColumnText')
              : t('ProjectManagement.DeleteModal.deleteCardText')
          }
          variants="primary"
          confirmButtonText={t('Button.deleteButton')}
          confirmButtonFunction={
            activeCard.column !== 0 ? handleDeleteColumn : handleDeleteCard
          }
          confirmButtonVariant="primary"
          cancelButtonText={t('Button.cancelButton')}
          cancelButtonFunction={() => {
            deleteModal.closeModal();
          }}
        />
      )}

      <UncontrolledBoard
        key={keyData}
        initialBoard={allBoardData}
        renderCard={handleRenderCard}
        renderColumnHeader={handleColumnHeader}
        allowAddColumn
        renderColumnAdder={customColumnAdder}
        onCardDragEnd={(data: any) => {
          dispatch(setBoardData({ columns: [...data.columns] }));
          setKeyData(customRandomNumberGenerator());
        }}
        onColumnDragEnd={(data: any) => {
          dispatch(setBoardData({ columns: [...data.columns] }));
        }}
      />
    </div>
  );
};

export default BoardComponent;
