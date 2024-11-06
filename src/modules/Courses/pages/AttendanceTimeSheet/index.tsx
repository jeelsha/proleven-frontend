import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
import Image from 'components/Image';
import LessonCard from 'components/LessonCard';
import PageHeader from 'components/PageHeader/PageHeader';
import { REACT_APP_ENCRYPTION_KEY } from 'config';
import { useQueryGetFunction } from 'hooks/useQuery';
import {
  AttendanceCourse,
  CompanyData,
  LessonSchedule,
  LessonSessionData,
  Participant,
} from 'modules/Courses/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { capitalizeFirstCharacter, customRandomNumberGenerator } from 'utils';
import { aesDecrypt } from 'utils/encrypt';

type AttendanceProps = {
  course_slug?: string;
  participate_slug?: string;
  company_id?: number;
  isCompanyManager?: boolean;
  setViewAttendance?: React.Dispatch<React.SetStateAction<boolean>>;
};

const AttendanceTimeSheet = ({
  course_slug,
  company_id,
  participate_slug,
  isCompanyManager = false,
  setViewAttendance,
}: AttendanceProps) => {
  const { t } = useTranslation();

  const KEY = REACT_APP_ENCRYPTION_KEY ?? '';

  const params = useParams();
  const decryptedCompany = params?.companySlug
    ? aesDecrypt(params?.companySlug, KEY)
    : '';

  const location = useLocation().state;
  const { response, refetch, isLoading } = useQueryGetFunction(
    '/course/attendance-sheet',
    {
      option: {
        course_slug: params?.courseSlug ?? course_slug,
        participate_slug: params?.participateSlug ?? participate_slug,
        company_id: company_id ?? Number(decryptedCompany),
      },
    }
  );
  const [company, setCompany] = useState<CompanyData>();
  const [participants, setParticipants] = useState<Participant>();
  const [attendance, setAttendance] = useState<LessonSchedule>();
  const [course, setCourse] = useState<AttendanceCourse>();

  useEffect(() => {
    if (response?.data) {
      setCompany(response?.data?.company);
      setParticipants(response?.data?.participate);
      setAttendance(response?.data?.attendance);
      setCourse(response?.data?.course);
    }
  }, [response]);

  const getVariants = (item: LessonSessionData) => {
    if (item.lessonSession.sessionAttendance < 90) {
      return 'red';
    }
    return 'secondary';
  };

  const getBackUrl = () => {
    if (location?.url) return location?.url;
    return `/courses/company-participant/attendance/${params?.courseSlug}?company=${params?.companySlug}`;
  };

  return (
    <>
      <PageHeader
        text={t('timeSheet.title')}
        url={getBackUrl()}
        passState={{ ...location, company_id: Number(decryptedCompany) }}
        small
        customHandleBack={
          !params?.courseSlug || isCompanyManager
            ? () => setViewAttendance?.(false)
            : undefined
        }
      />
      <CustomCard minimal>
        <>
          {isLoading ? (
            <div className="flex flex-wrap gap-6 justify-between">
              <div className="flex">
                <div className="h-28 w-[175px] lazy" />
                <div className="ps-6 ">
                  <div className="flex flex-col gap-y-1">
                    <div className="lazy h-6  w-[220px]" />
                    <div className="lazy w-2/3 h-6" />
                    <div className="lazy w-1/2 h-6" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            ''
          )}

          {!isLoading && !!response?.data ? (
            <>
              <div className="flex flex-wrap gap-6 justify-between">
                <div className="flex items-center">
                  <div className="h-28 w-[175px] rounded-md">
                    <Image
                      src={company?.logo ?? `/images/no-image.png`}
                      imgClassName="w-full h-full rounded-md"
                      serverPath
                    />
                  </div>

                  <div className="ps-6 max-w-[calc(100%_-_175px)]">
                    <div className="max-w-[600px] flex flex-col gap-y-1">
                      <Button className="text-base font-bold">
                        {company?.name
                          ? capitalizeFirstCharacter(company?.name)
                          : '-'}
                      </Button>
                      {company?.address1 && (
                        <p className="text-lg font-semibold leading-[1.2] text-primary">
                          {`${company?.address1 ?? '-'},${company?.address2 ?? '-'}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="">
                  <div className="flex flex-col items-end gap-y-2.5">
                    {participants?.first_name && (
                      <p className="text-xl leading-7 font-semibold">{`${capitalizeFirstCharacter(
                        participants?.first_name
                      )} ${capitalizeFirstCharacter(participants?.last_name)}`}</p>
                    )}
                    <div className="flex flex-wrap gap-y-4 text-sm leading-5 text-dark">
                      <Button>{participants?.email}</Button>
                      <Button className="opacity-50 inline-block mx-3">|</Button>
                      <Button>{participants?.code}</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <div className="p-7 bg-siteBG rounded-lg">
                  <div className="flex flex-wrap gap-5 mb-10">
                    <div className="flex flex-wrap gap-6">
                      <div className="flex flex-col flex-wrap gap-y-2.5">
                        <p className="text-sm leading-5 text-grayText">
                          {t('timeSheet.totalAttendance')}
                        </p>
                        <p className="text-2xl text-dark font-semibold">
                          {`${participants?.courseAttendance}%`}
                        </p>
                      </div>
                      <div className="flex flex-col flex-wrap gap-y-2.5">
                        <p className="text-sm leading-5 text-grayText">
                          {t('timeSheet.totalHours')}
                        </p>
                        <p className="text-2xl text-dark font-semibold">
                          {`${participants?.attendedHours} ${t('timeSheet.Hours')}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 ms-auto">
                      <div className="flex items-center gap-2">
                        <Button className="w-3 h-3 bg-orange2 inline-block rounded-full" />
                        <Button className="text-lg text-dark leading-5">
                          {t('timeSheet.breakTime')}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button className="w-3 h-3 bg-secondary inline-block rounded-full" />
                        <Button className="text-lg text-dark leading-5">
                          {t('timeSheet.onTime')}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button className="w-3 h-3 bg-red-500 inline-block rounded-full" />
                        <Button className="text-lg text-dark leading-5">
                          {t('timeSheet.late')}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-5">
                    {attendance &&
                      Object.keys(attendance)?.map((key) => {
                        return (
                          <div className="" key={customRandomNumberGenerator()}>
                            <label className="text-base text-dark font-bold mb-5 block">
                              {key}
                            </label>
                            <div className="grid grid-cols-3 gap-5">
                              {attendance[key].map((data) => {
                                return (
                                  <LessonCard
                                    refetch={refetch}
                                    key={data?.id}
                                    variants={getVariants(data)}
                                    lessonSessionData={data}
                                    mark_as_signed={{
                                      mark_as_start_signed:
                                        data?.mark_as_start_signed,
                                      mark_as_end_signed: data?.mark_as_end_signed,
                                    }}
                                    isCompanyManager={isCompanyManager}
                                    participateSlug={participants?.slug}
                                    participateId={participants?.id}
                                    course={course}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            ''
          )}
        </>
      </CustomCard>
    </>
  );
};

export default AttendanceTimeSheet;
