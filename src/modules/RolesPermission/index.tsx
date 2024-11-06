import Button from 'components/Button/Button';
import Checkbox from 'components/FormElement/CheckBox';
import Table from 'components/Table/Table';
import { ITableHeaderProps } from 'components/Table/types';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RolePermissionModal from './RolePermissionModal';
import { AccessUserData, IUserData } from './types';

import { UserModalType } from 'hooks/types';
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';
import _ from 'lodash';
import { useParams } from 'react-router-dom';

export const findKeyToPass = (
  isCourse?: boolean,
  isCourseBundle?: boolean,
  isSurveyTemplate?: boolean
) => {
  if (isCourse) {
    return 'course_slug';
  }
  if (isCourseBundle) {
    return 'course_bundle_slug';
  }
  if (isSurveyTemplate) {
    return 'survey_template_slug';
  }
};
type RolesPermissionProp = {
  isCourse?: boolean;
  isCourseBundle?: boolean;
  isSurveyTemplate?: boolean;
  slug?: string;
  courseBundleId?: number | null;
  rolesPermissionModal: UserModalType;
};
const RolesPermission = ({
  isCourse,
  isCourseBundle,
  isSurveyTemplate,
  slug,
  courseBundleId,
  rolesPermissionModal,
}: RolesPermissionProp) => {
  const params = useParams();
  const { t } = useTranslation();
  const key = findKeyToPass(isCourse, isCourseBundle, isSurveyTemplate);
  const [sort, setSort] = useState<string>('-updated_at');
  const getApiObj: { [key: string]: unknown } = {
    tableView: true,
    status: 'draft',
    allLanguage: false,
    view: true,
  };

  const [getAccessData, { isLoading }] = useAxiosGet();
  const [addUserWithPermission, { isLoading: AddUserLoader }] = useAxiosPost();

  const [userData, setUserData] = useState<IUserData[]>([]);
  useEffect(() => {
    getAccessTableData();
  }, [key]);

  const getAccessTableData = async () => {
    if (key) {
      getApiObj[key] = slug ?? (params.slug as string);
    }
    const response = await getAccessData('/access', {
      params: {
        sort,
        ...getApiObj,
      },
    });
    const cloneUser: IUserData[] = [];
    response?.data?.data?.forEach((item: AccessUserData) => {
      cloneUser.push({
        user_id: item.user_id,
        users: item.user.username,
        role: item.user.role.name,
        view: item.view,
        edit: item.edit,
        delete: item.delete,
      });
    });
    setUserData(cloneUser);
  };

  const columnData = [
    {
      header: t('UserManagement.columnHeader.no'),
      name: 'no',
      className: '',
      option: {
        sort: false,
        hasFilter: false,
        isIndex: true,
      },
    },
    {
      header: t('Access.TableUser.Header'),
      name: 'users',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Access.TableRole.Header'),
      name: 'role',
      option: {
        sort: false,
        hasFilter: false,
      },
    },
    {
      header: t('Access.Edit'),
      name: 'edit',
      className: 'capitalize',
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props: { edit?: boolean; user_id: number }) => {
        const userDelete = userData?.find(
          (item) => item.user_id === props.user_id
        )?.delete;
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <Checkbox
              check={props.edit}
              disabled={userDelete}
              onChange={(e) => {
                handleCheckBox(e, props, 'edit');
              }}
            />
          </label>
        );
      },
    },
    {
      header: t('Access.Delete'),
      name: 'delete',
      className: 'capitalize',
      option: {
        sort: false,
        hasFilter: false,
      },
      cell: (props: { delete?: boolean; user_id: number }) => {
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <Checkbox
              check={props.delete}
              onChange={(e) => {
                handleCheckBox(e, props, 'delete');
              }}
            />
          </label>
        );
      },
    },
  ];

  const handleCheckBox = (
    e: ChangeEvent<HTMLInputElement>,
    props: { user_id: number },
    type: string
  ) => {
    const cloneUser = [...userData];
    const user = cloneUser.find((data) => data.user_id === Number(props.user_id));
    if (
      (_.isNull(courseBundleId) ||
        _.isUndefined(courseBundleId) ||
        isCourseBundle) &&
      user
    ) {
      if (type === 'delete') {
        if (!user.edit) {
          user[type] = e.target.checked;
          user.edit = e.target.checked;
        } else {
          user[type] = e.target.checked;
        }
      }
      if (type === 'edit' || type === 'delete') {
        user[type] = e.target.checked;
        if (e.target.checked) {
          user.view = true;
        }
      }
      if (type === 'view' && !user.edit && !user.delete) {
        user[type] = e.target.checked;
      }
      setUserData(cloneUser);
    }
  };

  const handleSave = async () => {
    if (!_.isEmpty(userData)) {
      const key = findKeyToPass(isCourse, isCourseBundle, isSurveyTemplate);
      const keyToRemove = ['users', 'role'];
      const cloneUserData = JSON.parse(JSON.stringify(userData));
      cloneUserData.forEach((data: IUserData) => {
        keyToRemove.forEach((item) => {
          delete data[item];
        });
      });
      const objToPass: { [key: string]: unknown } = {
        access_permission: [...cloneUserData],
        is_single: false,
      };
      if (key) {
        objToPass[key] = slug ?? (params.slug as string);
      }
      const { error } = await addUserWithPermission('/access/create', objToPass);
      if (!error) {
        getAccessTableData();
      }
    }
  };

  return (
    <>
      <Table
        headerData={columnData as ITableHeaderProps[]}
        bodyData={userData}
        loader={isLoading}
        setSort={setSort}
        sort={sort}
      />

      {(_.isNull(courseBundleId) ||
        _.isUndefined(courseBundleId) ||
        isCourseBundle) && (
        <div className="col-span-2">
          <Button
            type="submit"
            variants="primary"
            isLoading={AddUserLoader}
            className="w-fit min-w-[100px] ms-auto"
            onClickHandler={() => handleSave()}
          >
            {t('Button.saveButton')}
          </Button>
        </div>
      )}
      {rolesPermissionModal.isOpen && (
        <RolePermissionModal
          modal={rolesPermissionModal}
          refetch={getAccessTableData}
          isCourse={isCourse}
          isCourseBundle={isCourseBundle}
          isSurveyTemplate={isSurveyTemplate}
          slug={slug}
        />
      )}
    </>
  );
};

export default RolesPermission;
