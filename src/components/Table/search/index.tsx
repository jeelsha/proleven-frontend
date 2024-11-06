import Button from 'components/Button/Button';
import ErrorMessage from 'components/FormElement/ErrorMessage';
import Image from 'components/Image';
import { RefObject } from 'react';

interface SearchInputProps {
  placeholder?: string;
  value?: string | number;
  onSearch?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlurOut?: React.FocusEventHandler<HTMLInputElement> | undefined;
  onClear?: () => void;
  parentClass?: string;
  IconparentClass?: string;
  inputClass?: string;
  ref?: RefObject<HTMLDivElement>;
  isSearchIcon?: boolean;
  loading?: boolean;
  name?: string;
}

const SearchComponent = ({
  value,
  placeholder,
  onSearch,
  onClear,
  parentClass,
  IconparentClass,
  inputClass,
  onBlurOut,
  ref,
  isSearchIcon = true,
  loading = false,
  name
}: SearchInputProps) => {
  return (
    <>
      <div
        className={`w-full relative h-fit ${parentClass ?? ''} flex items-center ${loading ? 'lazy' : ''
          }`}
        ref={ref}
      >
        {isSearchIcon && (
          <span
            className={`absolute z-[1] top-18px left-4 w-14px h-14px text-black/40 ${IconparentClass ?? ''
              }`}
          >
            <Image iconName="searchStrokeSD" iconClassName="w-full h-full" />
          </span>
        )}
        <input
          type="search"
          placeholder={placeholder}
          name={name ?? "search"}
          value={value}
          onBlur={onBlurOut}
          onChange={onSearch}
          autoComplete="off"
          className={`w-full max-w-full py-3 outline-none border border-gray-200 bg-white text-base font-normal relative rounded-xl text-grey-800 placeholder-grey-800  focus:ring-2 ring-offset-2 focus:ring-black/30 transition-all duration-300 ${inputClass ?? ''
            } ${isSearchIcon ? ' px-10' : ' pl-3 pr-10'}`}
        />

        {value && (
          <Button
            // title="Cancel"
            onClickHandler={onClear}
            className={`${
              // false ? 'hidden' : 'block'
              'block'
              } absolute top-1/2 -translate-y-1/2 right-4 items-center justify-center cursor-pointer ms-2 w-3 h-3  text-primaryColor rounded-md  transition-all duration-300`}
          >
            <Image iconName="crossIcon" iconClassName="w-full h-full" />
          </Button>
        )}
      </div>
      {name && <ErrorMessage name={name} />}
    </>
  );
};
export default SearchComponent;
