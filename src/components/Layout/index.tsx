// ** Packages **
// import { useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';

// ** Redux **
// import { getSidebarIsCollapse } from "redux/slices/commonSlice";
// import { getCurrentUser } from "redux/slices/authSlice";
import { toggleScroll } from 'redux-toolkit/slices/scrollSlice';

// ** Components **
import Footer from 'components/Layout/components/Footer';
import Header from 'components/Layout/components/Header';
import { ROLES } from 'constants/roleAndPermission.constant';
import React, { useEffect, useRef } from 'react';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';
import { SidebarSelector } from 'redux-toolkit/slices/sidebarSlice';
import Sidebar from './components/Sidebar';

type Props = {
  children: React.ReactNode;
};

const Layout = (props: Props) => {
  const { children } = props;
  const user = useSelector(getCurrentUser);
  const dispatch = useDispatch();

  // const sidebarIsCollapse = useSelector(getSidebarIsCollapse);
  // const sidebarRef = useRef<HTMLDivElement>(null);
  // const CurrentUser = useSelector(getCurrentUser);

  // sidebarIsCollapse ? "" : "sidebar__collapse"
  const openSidebar = useSelector(SidebarSelector);
  const lastScroll = useRef(0);

  useEffect(() => {
    const header: HTMLElement | null = document.querySelector('.main__cn__wrapper');

    const stickyHeader = (): void => {
      if (!header) return;

      const scroll = header.scrollTop + header.offsetHeight;
      const pageHeader: HTMLElement | null = document.querySelector('#pageHeader');
      if (!pageHeader) return;
      if (
        scroll > lastScroll.current &&
        scroll < header.scrollHeight + header.offsetHeight
      ) {
        dispatch(toggleScroll({ isScrollUp: true }));
      } else if (scroll < lastScroll.current) {
        dispatch(toggleScroll({ isScrollUp: false }));
      }
      if (scroll < header.scrollHeight + header.offsetHeight) {
        lastScroll.current = scroll;
      }
    };

    header?.addEventListener('scroll', stickyHeader);

    return () => {
      header?.removeEventListener('scroll', stickyHeader);
    };
  }, []);

  return (
    <div className="main__wrapper">
      {user?.role_name === ROLES.CompanyManager ||
        user?.role_name === ROLES.PrivateIndividual ? (
        <>
          <Header />
          <div className="main__cn__wrapper max-h-[calc(100dvh_-_142px)] min-h-[70dvh] overflow-auto pb-5 pt-5">
            {children}
          </div>
          <Footer />
        </>
      ) : (
        <>
          <Sidebar />
          <div
            className={`contentR__wrapper relative ms-auto transition-all duration-500 ${openSidebar ? 'md:w-[calc(100%_-_270px)]' : 'md:w-[calc(100%_-_100px)]'
              }`}
          >
            <Header />
            <div
              className="main__cn__wrapper h-[calc(100dvh_-_89px)] overflow-auto overflow-x-hidden z-1 pb-16 px-4 sm:px-6 md:px-8"
              id="scrollable-form"
            >
              {children}
            </div>
            <Footer />
          </div>
        </>
      )}
    </div>
  );
};

export default Layout;
