import Button from 'components/Button/Button';
import 'components/CompanyCard/style/companyCard.css';
import Checkbox from 'components/FormElement/CheckBox';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import { REACT_APP_ENCRYPTION_KEY } from 'config';
import { isTodayGreaterThanGivenDate } from 'modules/Courses/helper/CourseCommon';
import { CompanyData } from 'modules/Courses/types';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { aesEncrypt } from 'utils/encrypt';

type companyCardProps = {
  company?: CompanyData;
  activeTab?: number;
  courseState?: { [key: string]: unknown };
  companyIds?: number[];
  handleOnChangeCheckBox?: (
    checkData: React.ChangeEvent<HTMLInputElement>,
    trainerIds: number[]
  ) => void;
};
const CompanyCard = ({
  company,
  activeTab,
  courseState,
  companyIds,
  handleOnChangeCheckBox,
}: companyCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { state } = useLocation();

  const params = useParams();

  const KEY = REACT_APP_ENCRYPTION_KEY ?? '';

  const getParticipationText = (company?: CompanyData) => {
    if (company?.course_participate_count === 0) return '-';

    if (company?.course_participate_count === company?.signed_participate_count)
      return t('companyCard.signedText');

    return t('companyCard.unSignedText');
  };

  const isCourseCompleted = company?.course?.end_date
    ? isTodayGreaterThanGivenDate(company?.course?.end_date)
    : company?.course?.end_date;

  return (
    <div className="">
      <div className="border border-solid border-borderColor pt-2.5 px-2.5 rounded-xl flex flex-col gap-y-7">
        <div className="flex">
          <div className="flex flex-[1_0_0%]">
            {company?.company?.id ? (
              <div className="w-24 h-24 overflow-hidden rounded-md">
                <Image
                  src={company?.company_logo}
                  imgClassName="w-full h-full object-cover"
                  width={96}
                  height={96}
                  serverPath
                />
              </div>
            ) : (
              <div className="w-24 h-24 overflow-hidden rounded-md">
                <Image
                  src={
                    company?.private_individual?.profile_image ??
                    '/images/no-image.png'
                  }
                  imgClassName="w-full h-full object-cover"
                  width={96}
                  height={96}
                  serverPath
                />
              </div>
            )}

            <div className="flex-[1_0_0%] px-5 flex justify-between flex-col">
              {company?.company?.id ? (
                <p className="text-base font-semibold leading-5">
                  {company?.company_name}
                </p>
              ) : (
                <p className="text-base font-semibold leading-5">
                  {company?.private_individual?.first_name}
                </p>
              )}
              {company?.company?.id !== null && (
                <p className="text-xs leading-4 text-dark">
                  <span>
                    {t('ProjectManagement.CustomCardModal.Button.manager')}:
                  </span>
                  <span className="block font-semibold">
                    {company?.manager_name}
                  </span>
                </p>
              )}
            </div>
          </div>
          {company?.course_participate_count !== company?.signed_participate_count &&
          isCourseCompleted ? (
            <Checkbox
              value={company?.company?.id}
              parentClass="shrink-0"
              onChange={(checkData) => {
                if (companyIds) {
                  handleOnChangeCheckBox?.(checkData, companyIds);
                }
              }}
              customClass="!rounded-[2px] checked:!bg-secondary/70 checked:!ring-secondary/70"
            />
          ) : (
            ''
          )}
        </div>
        <div className="flex flex-wrap border border-solid border-borderColor">
          <div className="flex flex-[1_0_0%] flex-col gap-y-3 p-1.5 border-e border-borderColor border-solid last:border-none">
            <Button className="text-xs leading-4 text-dark block whitespace-nowrap">
              {t('companyCard.sheetSignatureStatus')}
            </Button>
            <StatusLabel text={getParticipationText(company)} variants="primary" />
          </div>
          <div className="flex flex-[1_0_0%] flex-col gap-y-3 p-1.5 border-e border-borderColor border-solid last:border-none">
            <Button className="text-xs leading-4 text-dark block whitespace-nowrap">
              {t('companyCard.participates')}
            </Button>
            <StatusLabel
              text={
                company?.course_participate_count
                  ? company?.course_participate_count.toString()
                  : '0'
              }
              variants="neon"
            />
          </div>
        </div>

        <div className="flex -mx-2.5">
          <Button
            className="flex-[1_0_0%] gap-1 !rounded-r-none !rounded-tl-none"
            onClickHandler={() => {
              let url = `/course/attendees/${params.slug}?`;
              url += company?.company_slug ? `company=${company?.company_slug}` : '';
              url += company?.private_individual?.username
                ? `${url ? '&' : ''}private_individual=${
                    company?.private_individual?.username
                  }`
                : '';
              navigate(url, {
                state: {
                  private_individualId: company?.private_individual?.id,
                  private_individualSlug: company?.private_individual?.username,
                  company_slug: company?.company_slug,
                  publish_course_slug: state?.publish_course_slug,
                  activeTab,
                  status: courseState?.status,
                },
              });
            }}
            variants="secondary"
          >
            <Image iconName="cardTickIcon" iconClassName="w-4 h-4" />
            {t('companyCard.examResults')}
          </Button>
          <Button
            className="flex-[1_0_0%] gap-1 !rounded-l-none !rounded-tr-none"
            onClickHandler={() => {
              const companyId = company?.company?.id
                ? company?.company?.id?.toString()
                : '';
              const encryptedCompany = aesEncrypt(companyId, KEY);
              navigate(
                `/courses/company-participant/attendance/${company?.course_slug}?company=${encryptedCompany}`,
                {
                  state: {
                    company_id: company?.company?.id,
                    publish_course_slug: state?.publish_course_slug,
                    activeTab,
                    status: courseState?.status,
                  },
                }
              );
            }}
            variants="primary"
          >
            <Image iconName="eyeIcon" iconClassName="w-4 h-4" />
            {t('Tooltip.Attendance')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
