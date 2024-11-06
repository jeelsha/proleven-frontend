// ** imports
import { useTranslation } from 'react-i18next';

// ** components **
import Button from 'components/Button/Button';
import StatusLabel from 'components/StatusLabel';

// ** styles **
import 'modules/Courses/style/index.css';

// ** types **
import CustomCard from 'components/Card';
import Image from 'components/Image';
import { ROLES } from 'constants/roleAndPermission.constant';
import {
  AttendeeResult,
  AttendeeResultViewProps,
} from 'modules/Courses/types/survey';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';

export const AttendeeResultShow = ({ response }: AttendeeResultViewProps) => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(0);
  const CurrentUser = useSelector(getCurrentUser);

  const handleManagerClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) => {
    event.stopPropagation();
    setOpenIndex(index === openIndex ? -1 : index);
  };
  // const handleOuterDivClick = (index: number) => {
  //   setOpenIndex(index);
  // };
  return (
    <CustomCard
      minimal
      title={response?.course?.title}
      headerClass={`${CurrentUser?.role_name === ROLES.Admin ? '!px-0 !pt-0' : ''}`}
      cardClass={`mt-4 ${
        CurrentUser?.role_name === ROLES.Admin ? '!p-0 !shadow-none' : ''
      }`}
      bodyClass={`${CurrentUser?.role_name === ROLES.Admin ? '!px-0 !pb-0' : ''}`}
    >
      <div className="flex flex-wrap justify-between gap-y-3.5 flex-col">
        {Array.isArray(response?.data) &&
          response?.data &&
          response?.data?.length > 0 &&
          response?.data?.map((resultInfo, index: number) => {
            return (
              <div
                className="transition py-3.5 px-4 rounded-xl bg-white border border-solid border-borderColor"
                key={`option_${index + 1}`}
              >
                <div
                  className={`flex justify-between items-center ${
                    openIndex === index ? 'mb-10' : ''
                  }`}
                >
                  <h4 className="text-dark font-semibold text-sm">
                    {t('attendees.exam.result.attemptTitle')} {index + 1}
                  </h4>
                  {response?.data && response?.data?.length > 1 && (
                    <Button
                      className="w-7 h-7 cursor-pointer rounded-full border-2 p-1 border-solid border-primary text-primary"
                      onClickHandler={(event) =>
                        handleManagerClick(
                          event as unknown as React.MouseEvent<
                            HTMLDivElement,
                            MouseEvent
                          >,
                          index
                        )
                      }
                    >
                      <Image
                        iconName="chevronLeft"
                        iconClassName={`w-full h-full stroke-[3] ${
                          openIndex === index
                            ? 'rotate-90'
                            : '-rotate-90 translate-y-px'
                        }`}
                      />
                    </Button>
                  )}
                </div>
                <div
                  className={`grid  gap-4 transition-all ${
                    openIndex === index ? '' : 'hidden'
                  }`}
                >
                  <div className="pb-4">
                    <div className="flex justify-end flex-col items-end gap-3">
                      <p className="text-base font-medium">
                        {t('attendees.result.marksTitle')} :{resultInfo?.total_marks}
                        /{Number(resultInfo?.outOfMarks)}
                      </p>
                      <StatusLabel
                        variants="secondary"
                        text={
                          resultInfo?.data?.[0]?.exam_participate
                            ?.status_without_attendance
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-5">
                      {Array.isArray(resultInfo?.data) &&
                        (resultInfo?.data ?? [])?.length > 0 &&
                        resultInfo?.data?.map(
                          (resultData: AttendeeResult, index: number) => (
                            <div
                              key={`result_${index + 1}`}
                              className="flex flex-wrap pb-5 border-b border-solid border-borderColor last:border-none last:pb-0"
                            >
                              <div className="flex flex-col gap-4">
                                <p className="text-base font-medium">
                                  <Button className="w-6 inline-block">
                                    {index + 1}.&nbsp;
                                  </Button>
                                  {resultData?.question}
                                </p>
                                <div className="flex flex-col gap-4">
                                  <div className="flex flex-wrap gap-2 ps-4">
                                    {resultData?.options?.map(
                                      (answer, answerIndex: number) => {
                                        let borderClass =
                                          'bg-white text-black border-borderColor';

                                        if (resultData.correctAnswer === answer) {
                                          borderClass =
                                            'bg-green2/10 text-green2 border-green2/50';
                                        }
                                        if (
                                          resultData.correctAnswer !== answer &&
                                          resultData.userAnswer === answer
                                        ) {
                                          borderClass =
                                            'bg-danger/10 text-danger border-danger/50';
                                        }

                                        const className = `mis-match-answer-button ${borderClass}`;
                                        return (
                                          <Button
                                            key={`answer_${index + 1}_${
                                              answerIndex + 1
                                            }`}
                                            className={className}
                                          >
                                            {answer}
                                          </Button>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="ms-auto mt-auto">
                                {!resultData?.isCorrect ? (
                                  <p className="text-danger text-sm font-medium">
                                    {t('attendees.result.wrongAnswerTitle')}
                                  </p>
                                ) : (
                                  <p className="text-green2 text-sm font-medium">
                                    {t('attendees.result.rightAnswerTitle')}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </CustomCard>
  );
};
