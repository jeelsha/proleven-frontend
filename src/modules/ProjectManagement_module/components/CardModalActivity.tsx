// ** component **
import Button from 'components/Button/Button';
import Image from 'components/Image';
import StatusLabel from 'components/StatusLabel';
import { Form, Formik, FormikValues } from 'formik';
import ProjectPipeLineEditor from './ProjectPipelineEditor/Editor';

// ** type **
import { BoardData, Cards } from '../types';

// ** utils **
import _ from 'lodash';
import { setCardData, useGetCardDetail } from '../utils';

// ** hooks **
import { useAxiosPost } from 'hooks/useAxios';
import { Dispatch, SetStateAction, useEffect } from 'react';

// ** Styles **
import 'modules/ProjectManagement_module/style/index.css';
import '../../../components/FormElement/style/inputField.css';

export interface MembersProps {
  id: number;
  display: string;
  value?: string;
}
export const cardMentionMember: string[] = [];

const CardModalActivity = (props: {
  card_id: number;
  initialBoardData: Cards;
  setInitialBoardCard: Dispatch<SetStateAction<Cards>>;
  isCoursePipeline?: boolean;
  setInitialBoard?: React.Dispatch<React.SetStateAction<BoardData>>;
  isMove?: React.MutableRefObject<boolean>;
  replyData?: {
    isReply: boolean;
    reply_user_id: string;
    reply_comment_id: string;
  };
  setReplyData?: React.Dispatch<
    React.SetStateAction<{
      isReply: boolean;
      reply_user_id: string;
      reply_comment_id: string;
    }>
  >;
}) => {
  const {
    card_id,
    setInitialBoardCard,
    isCoursePipeline,
    setInitialBoard,
    isMove,
    initialBoardData,
    replyData,
    setReplyData,
  } = props;
  const [createNewActivityDescription] = useAxiosPost();
  const [createCommentReply] = useAxiosPost();
  const { getCardDetail } = useGetCardDetail();
  useEffect(() => {
    cardMentionMember.splice(0, cardMentionMember.length);
    cardMentionMember.push('all');
    initialBoardData?.card_members?.forEach((member) => {
      cardMentionMember.push(
        `${member?.member?.first_name} ${member?.member?.last_name}`
      );
    });
  }, [initialBoardData?.card_members]);

  const initialActivity = {
    activity: '',
    mention_ids: [],
  };
  const membersDropdown: MembersProps[] | undefined = initialBoardData?.card_members
    ?.map((data): MembersProps | null => {
      if (data.member)
        return {
          display: `${data.member.first_name} ${data.member.last_name}`,
          id: data.member.id,
        };
      return null;
    })
    .filter((item): item is MembersProps => item !== null);
  const allMemberIds: number[] =
    initialBoardData?.card_members
      ?.map((data) => data.member?.id || 0)
      .filter((id) => id !== 0) || [];

  const allOption: { display: string; id: number | string } = {
    display: 'all',
    id: allMemberIds.join(','),
  };
  membersDropdown?.unshift(allOption as { display: string; id: number });

  const OnSubmit = async (data: FormikValues) => {
    if (isMove) {
      isMove.current = true;
    }
    const url = isCoursePipeline
      ? '/boards/course-management/card/'
      : '/boards/project-management/card/';
    const bodyData = {
      description: data.activity,
      mention_ids: data.mention_ids,
    };
    if (replyData?.isReply) {
      const commentPayload = {
        parent_comment_id: Number(replyData?.reply_comment_id),
        description: bodyData.description,
      };
      const { error } = await createCommentReply(
        `/cards/reply/${card_id}`,
        commentPayload
      );
      if (!error) {
        setReplyData?.({
          isReply: false,
          reply_user_id: '',
          reply_comment_id: '',
        });
      }
    } else {
      await createNewActivityDescription(`cards/activity/${card_id}`, {
        ...bodyData,
      });
    }
    await getCardDetail({ url, card_id, setInitialBoardCard });

    setCardData({
      setInitialBoard,
      initialBoardData,
      keyToInsert: 'card_activities',
    });
  };

  return (
    <div className="select-none flex items-center gap-x-3">
      <Formik
        initialValues={initialActivity}
        onSubmit={(values, { resetForm }) => {
          if (values.activity !== '<p></p>') {
            const editorContent =
              document.getElementsByClassName('tiptap ProseMirror')[0];
            editorContent.innerHTML = '';
            OnSubmit(values);
          }
          resetForm();
        }}
      >
        {({ values, setFieldValue, setFieldTouched }) => {
          const user = initialBoardData?.card_activities?.find(
            (item) => item?.createdByUser?.id === Number(replyData?.reply_user_id)
          )?.createdByUser;
          return (
            <Form
              className={`w-full pt-3 bg-white ${
                replyData?.isReply ? 'border rounded-10px p-3 mt-4' : ''
              }`}
            >
              {replyData?.isReply && (
                <div className="mb-2 text-xs flex gap-2 items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold text-dark">Reply to:</span>
                    <StatusLabel
                      className="!text-xs !px-1.5 !py-1"
                      text={`${user?.first_name} ${user?.last_name}`}
                      variants="cancelled"
                    />
                  </div>
                  <Button
                    parentClass="h-fit"
                    className="text-danger  cursor-pointer"
                    onClickHandler={() =>
                      setReplyData?.({
                        isReply: false,
                        reply_comment_id: '',
                        reply_user_id: '',
                      })
                    }
                  >
                    <Image
                      iconName="crossIcon"
                      iconClassName="w-3 h-3 stroke-current"
                    />
                  </Button>
                </div>
              )}
              <div className="relative border rounded-lg custom-editor pb-2">
                <ProjectPipeLineEditor
                  parentClass="h-unset"
                  name="activity"
                  setFieldValue={setFieldValue}
                  setFieldTouched={setFieldTouched}
                  value={values.activity}
                  tagDropdown={membersDropdown}
                />
                <Button
                  disabled={_.isEmpty(values.activity)}
                  variants="primary"
                  className="w-[32px] h-[32px] !p-2 mt-2 mr-2 ml-auto"
                  type="submit"
                >
                  <Image iconName="sendIcon" iconClassName="w-full h-full" />
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default CardModalActivity;
