// ** Packages **
import { combineReducers } from '@reduxjs/toolkit';

// ** Redux Slices **
import { reducer as authReducer } from './slices/authSlice';
import { reducer as boardSlice } from './slices/boardDataSlice';
import { reducer as companyReducer } from './slices/companySlice';
import { reducer as countryJsonReducer } from './slices/countryJsonSlice';
import { reducer as titleReducer } from './slices/documentTitleSlice';
import { reducer as filterOptionsReducer } from './slices/filtereventSlice';
import { reducer as languageReducer } from './slices/languageSlice';
import { reducer as isReadReducer } from './slices/notificationReadSlice';
import { reducer as paginationReducer } from './slices/paginationSlice';
import { reducer as pipelineFilterStateReducer } from './slices/pipelineFilterAssignSlice';
import { reducer as pipelineBottomScrollReducer } from './slices/pipelineScrollSlice';
import { reducer as rolePermissionReducer } from './slices/rolePermissionSlice';
import { reducer as scrollReducer } from './slices/scrollSlice';
import { reducer as SideBarReducer } from './slices/sidebarSlice';
import { reducer as socketReducer } from './slices/socketSlice';
import { reducer as toastReducer } from './slices/toastSlice';
import { reducer as tokenReducer } from './slices/tokenSlice';
import { reducer as trainerSlug } from './slices/trainerSlugSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  commonToast: toastReducer,
  language: languageReducer,
  sidebar: SideBarReducer,
  socket: socketReducer,
  token: tokenReducer,
  currentPage: paginationReducer,
  rolePermission: rolePermissionReducer,
  countryJson: countryJsonReducer,
  isRead: isReadReducer,
  filterOptions: filterOptionsReducer,
  boardData: boardSlice,
  company: companyReducer,
  pipelineScrollLeft: pipelineBottomScrollReducer,
  filterAssign: pipelineFilterStateReducer,
  scroll: scrollReducer,
  title: titleReducer,
  trainerSlug,
});

export default rootReducer;
