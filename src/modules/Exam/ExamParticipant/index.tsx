// ** imports **
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// ** hooks **
import { useAxiosGet } from 'hooks/useAxios';

// ** components **
import NotAuthorized from 'modules/Auth/pages/NotAuthorized';
import ParticipantForm from 'modules/Exam/ExamParticipant/ParticipantForm';
import PageLoader from 'components/Loaders/PageLoader';

const ExamParticipant = () => {
  const params = useParams();
  const [validateExam, setValidateExam] = useState();
  const [participateDataGet, { isLoading }] = useAxiosGet();

  const ValidateParticipate = async () => {
    const { data } = await participateDataGet(`/exam/is-exam`, {
      params: { exam_slug: params?.slug },
    });
    setValidateExam(data);
  };

  useEffect(() => {
    ValidateParticipate();
  }, []);

  let PageLoad = null;

  if (isLoading) {
    PageLoad = <PageLoader />;
  } else {
    PageLoad = validateExam ? <ParticipantForm /> : <NotAuthorized />;
  }

  return <>{PageLoad}</>;
};

export default ExamParticipant;
