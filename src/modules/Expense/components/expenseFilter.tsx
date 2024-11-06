import Button from 'components/Button/Button';
import ReactSelect from 'components/FormElement/ReactSelect';
import { Option } from 'components/FormElement/types';
import { ExpenseType } from 'constants/common.constant';
import { Form, Formik } from 'formik';
import { useAxiosGet } from 'hooks/useAxios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterExpenseProps, expenseProps } from '../types';
import { useDispatch } from 'react-redux';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';

const ExpenseFilter = ({
  setFilterModal,
  setExpenseFilters,
  expenseFilters,
}: FilterExpenseProps) => {
  const dispatch = useDispatch();

  const [expenseName, setExpenseName] = useState<Option[]>([]);
  const { t } = useTranslation();
  const [getAllSupplierName] = useAxiosGet();

  const getExpenseData = async () => {
    const { data } = await getAllSupplierName('/expense/name', {
      params: {
        dropdown: true,
        label: 'name',
        value: 'name',
      },
    });

    setExpenseName(data);
  };

  useEffect(() => {
    getExpenseData();
  }, []);

  const handleSubmit = (data: expenseProps) => {
    setExpenseFilters(data);
    setFilterModal(false);
    dispatch(currentPageCount({ currentPage: 1 }));
  };

  return (
    <Formik
      initialValues={{
        name: [...(expenseFilters?.name ?? {})],
        category: [...(expenseFilters?.category ?? {})],
      }}
      onSubmit={(data) => {
        handleSubmit(data);
      }}
    >
      {({ setFieldValue }) => (
        <Form>
          <div>
            <div className="flex flex-col gap-y-3 mt-4">
              <ReactSelect
                name="name"
                label={t('Expense.SupplierName')}
                options={expenseName}
                isMulti
              />
              <ReactSelect
                name="category"
                label={t('Expense.category')}
                options={ExpenseType}
                isMulti
              />
            </div>
          </div>
          <div className="flex flex-col-2 gap-2">
            <Button
              type="submit"
              className="w-full flex items-center justify-center text-xs leading-5 gap-1 mt-5 !py-1"
              variants="primary"
            >
              {t('ProjectManagement.CustomCardModal.Button.apply')}
            </Button>
            <Button
              onClickHandler={() => {
                setExpenseFilters({
                  category: [],
                  name: [],
                });
                setFieldValue('name', '');
                setFieldValue('category', '');
                // setExpenseName([])
                // setExpenseCategory([])
                setFilterModal(false);
                dispatch(currentPageCount({ currentPage: 1 }));
              }}
              className="w-full flex items-center justify-center text-xs leading-5 gap-1 mt-5"
              variants="primary"
            >
              {t('CompanyManager.courses.clearFiltersTitle')}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ExpenseFilter;
