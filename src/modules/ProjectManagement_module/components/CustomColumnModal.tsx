import { Form, Formik, FormikValues } from 'formik';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

// ** component **
import Button from 'components/Button/Button';
import InputField from 'components/FormElement/InputField';
import { Modal } from 'components/Modal/Modal';

// ** type **
import { UserModalType } from 'hooks/types';
import { ActiveCardType, Cards, Columns } from '../types';

// ** utils **
import { customRandomNumberGenerator } from 'utils';
import { closeOnEscape, matchId } from '../utils';

// ** redux **
import { getBoardData, setBoardData } from 'redux-toolkit/slices/boardDataSlice';

// ** validation **
import { columnValidationSchema } from '../validationSchema';

const CustomColumnModal = (props: {
  modal: UserModalType;
  setKeyData: React.Dispatch<React.SetStateAction<number>>;
  columnId: ActiveCardType;
}) => {
  const { modal, setKeyData, columnId } = props;
  const { t } = useTranslation();

  const dispatch = useDispatch();

  let columnData: Pick<Columns, 'id' | 'title' | 'cards'> = {
    id: 0,
    title: '',
    cards: [],
  };
  const init = { columns: useSelector(getBoardData) };
  const allBoardData = init.columns.length === 0 ? { columns: [] } : init;
  const result: Columns | Cards | Cards[] =
    // Check if the targetId exists in the data
    columnId.column !== 0
      ? matchId(allBoardData, columnId.column) ?? {
          id: 0,
          title: '',
          cards: [],
        }
      : { id: 0, title: '', cards: [] };

  // useEffect(() => {
  if (result.id !== 0) {
    columnData = {
      id: result.id,
      title: result.title,
      cards: result.cards as unknown as Cards[],
    };
  }
  // }, [result]);

  // Close modal press escape key
  useEffect(() => {
    closeOnEscape(modal);
  }, []);

  const OnSubmit = async (userData: FormikValues) => {
    const cardId = result.id !== 0 ? userData.id : customRandomNumberGenerator();

    const loginData = {
      id: cardId,
      title: userData.title,
      cards: [],
    };

    let newCardData =
      init.columns.length === 0
        ? { columns: [] }
        : { columns: allBoardData.columns as Columns[] };
    if (result.id !== 0) {
      const updatedColumn = newCardData.columns.map((data: Columns) => {
        if (data.id === columnId.column) {
          return {
            ...data,
            title: loginData.title,
            cards: [...data.cards],
          };
        }
        return data;
      });
      newCardData = { columns: updatedColumn };
      dispatch(setBoardData({ columns: [...newCardData.columns] }));
    } else {
      dispatch(setBoardData({ columns: [...newCardData.columns, loginData] }));
    }
    setKeyData(customRandomNumberGenerator());

    modal.closeModal();
  };
  return (
    <Modal headerTitle="Column Modal" modal={modal} width="max-w-[600px]">
      <div>
        <Formik
          initialValues={columnData}
          onSubmit={(values) => OnSubmit(values)}
          validationSchema={columnValidationSchema()}
        >
          {({ values }) => (
            <div className="form-group2">
              <Form>
                <div className="grid grid-cols-1 gap-4">
                  <InputField
                    placeholder={t('ProjectManagement.CustomCardModal.title')}
                    type="text"
                    value={values.title}
                    label={t('ProjectManagement.CustomCardModal.title')}
                    name="title"
                  />
                </div>
                <div className="mt-2">
                  <Button
                    type="submit"
                    value={t('ProjectManagement.CustomCardModal.Button.save')}
                    className="w-full bg-primary font-medium p-3 text-center text-white rounded-lg hover:bg-secondary transition-all"
                  />
                </div>
              </Form>
            </div>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default CustomColumnModal;
