// ** Components ***
import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import Image from 'components/Image';

// ** hooks ***
import { useToggleDropdown } from 'hooks/useToggleDropdown';
import { useDispatch } from 'react-redux';

// ** types ***
import { StatusFilterProps } from 'modules/UsersManagement/types';

// ** Slices ***
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';

// ** Utils ***
import { customRandomNumberGenerator } from 'utils';

const StatusFilterComponent = ({
  title,
  statusFilter,
  setStatusFilter,
}: StatusFilterProps) => {
  const modalRef = useToggleDropdown();

  const dispatch = useDispatch();
  const handleStatusFilterChange = async (field: string) => {
    const updatedStatusFilter = statusFilter.map((item) => {
      return item.key === field ? { ...item, isChecked: !item.isChecked } : item;
    });
    dispatch(currentPageCount({ currentPage: 1 }));
    setStatusFilter(updatedStatusFilter);
  };

  return (
    <div className="flex gap-2 items-center" ref={modalRef?.dropdownRef}>
      {title}
      <Button
        className="relative group z-2"
        onClickHandler={modalRef?.toggleDropdown}
      >
        <Image iconName="filterIcon" width={20} height={20} />
        {modalRef?.isDropdownOpen ? (
          <div className="visible h-auto  absolute top-7 right-0 shadow-md rounded-md bg-white flex flex-col">
            <div className="absolute w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white -top-2 right-0" />
            {statusFilter?.map((item) => {
              return (
                <div
                  key={customRandomNumberGenerator()}
                  className={`flex px-4 py-2 gap-4 items-center  whitespace-nowrap ${
                    item.key === 'selectAll' ? 'border-b border-b-borderColor' : ''
                  }`}
                >
                  <Checkbox
                    text={item.title}
                    check={item.isChecked}
                    onChange={() => handleStatusFilterChange(item.key)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          ''
        )}
      </Button>
    </div>
  );
};

export default StatusFilterComponent;
