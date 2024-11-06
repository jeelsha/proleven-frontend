// ** imports **
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';

// ** components **
import CustomCard from 'components/Card';
import PageHeader from 'components/PageHeader/PageHeader';
import TabComponent from 'components/Tabs';
import { AttendeeResultShow } from './AttendeeResultShow';
import { AttendeeSurveyShow } from './AttendeeSurveyShow';

// ** hooks **
import { useAxiosGet } from 'hooks/useAxios';
import { useQueryGetFunction } from 'hooks/useQuery';

// ** types **
import { SurveyShowProps } from 'modules/Exam/types';

const AttendeeTabView = () => {
  const { t } = useTranslation();
  const { examSlug, examId } = useParams();
  const { state } = useLocation();
  const [surveyData, setSurveyData] = useState<SurveyShowProps[] | undefined>();
  const { response } = useQueryGetFunction(`/exam/attendee-result`, {
    option: { exam_slug: examSlug, exam_participate_slug: examId },
    limit: 5,
  });

  const [getSurveyApi] = useAxiosGet();
  const GetSurveyDetails = async () => {
    const response1 = await getSurveyApi(`/survey/submission`, {
      params: {
        exam_participate_slug: examId,
        course_slug: response?.data?.course?.slug,
      },
    });
    setSurveyData(response1.data);
  };
  useEffect(() => {
    if (response) {
      GetSurveyDetails();
    }
  }, [response]);

  const getUrl = () => {
    let url = `/course/attendees/${response?.data?.course?.slug}`;
    const queryParams = [];
    if (state?.company_slug) {
      queryParams.push(`company=${state.company_slug}`);
    }
    if (state?.private_individual?.username) {
      queryParams.push(`private_individual=${state.private_individual.username}`);
    }
    if (queryParams.length) {
      url += `?${queryParams.join('&')}`;
    }
    return url;
  };

  return (
    <>
      <PageHeader
        small
        text={t('attendees.result.title')}
        url={getUrl()}
        passState={{ ...state }}
      />
      <div className="flex flex-col gap-y-5">
        <CustomCard minimal>
          <div>
            <p className="text-xl font-semibold text-dark">
              {response?.data?.attendees?.first_name}
              {response?.data?.attendees?.last_name}
            </p>
            <div className="flex">
              <p className="text-sm">
                {response?.data?.attendees?.email}
                {response?.data?.attendees?.mobile_number
                  ? `| ${response?.data?.attendees?.mobile_number}`
                  : ''}
              </p>
            </div>
          </div>
        </CustomCard>
        <CustomCard minimal>
          <TabComponent current={0}>
            <TabComponent.Tab title={t('Exam.title')} icon="bookIcon2">
              <AttendeeResultShow response={response?.data} />
            </TabComponent.Tab>
            <TabComponent.Tab
              title={t('CourseManagement.createSurvey.AttendeeTabView')}
              icon="bookIcon"
            >
              <AttendeeSurveyShow surveyData={surveyData} t={t} />
            </TabComponent.Tab>
          </TabComponent>
        </CustomCard>
      </div>
    </>
  );
};
export default AttendeeTabView;
