import { IconTypes } from 'components/Icon/types';
import Image from 'components/Image';
import SearchComponent from 'components/Table/search';
import React, { Children, cloneElement, ReactNode, useState } from 'react';
import './style/style.css';

interface TabComponentProps {
  current: number;
  children: ReactNode;
  searchable?: boolean;
  onSearch?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTabChange?: (tabIndex: number) => void;
  sideComponent?: JSX.Element | null;
}
interface TabProps {
  title?: string;
  icon?: IconTypes;
  isActive?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

const TabComponent: React.FC<TabComponentProps> & { Tab: React.FC<TabProps> } = ({
  current,
  children,
  searchable,
  onSearch,
  onTabChange,
  sideComponent,
}: TabComponentProps) => {
  const [currentTab, setCurrentTab] = useState<number>(current || 0);

  const handleTabClick = (tabIndex: number) => {
    setCurrentTab(tabIndex);
    if (onTabChange) {
      onTabChange(tabIndex);
    }
  };

  const getActiveTabTitle = (): string => {
    const activeTabElement = children && children[currentTab as keyof ReactNode];

    if (React.isValidElement<TabProps>(activeTabElement)) {
      return activeTabElement.props.title ?? '';
    }

    return '';
  };
  return (
    <div className="tab-wrapper">
      <div className="tab-header">
        <div className="tab-items">
          {Children.map(children, (child, index) =>
            cloneElement(child as React.ReactElement<TabProps>, {
              isActive: index === currentTab,
              onClick: () => handleTabClick(index),
            })
          )}
        </div>
        {sideComponent}
        {searchable && (
          <SearchComponent
            parentClass="mb-2.5 max-w-[320px]"
            onSearch={onSearch}
            placeholder={`Search ${getActiveTabTitle()}`}
          />
        )}
      </div>
      <div className="tab-content mt-4">
        {Children.map(children, (child, index) => {
          if (React.isValidElement<TabProps>(child)) {
            return (
              <div
                key={`child_${index + 1}`}
                style={{ display: index === currentTab ? 'block' : 'none' }}
              >
                {child.props.children}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

const Tab: React.FC<TabProps> = ({
  title,
  isActive,
  onClick,
  icon,
}: Omit<TabProps, 'children'>) => {
  return (
    <div className={`tab-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      {icon && (
        <span className="inline-block w-4 h-4 me-1">
          <Image iconClassName="w-full h-full" iconName={icon} />
        </span>
      )}
      {title}
    </div>
  );
};

TabComponent.Tab = Tab;

export default TabComponent;
