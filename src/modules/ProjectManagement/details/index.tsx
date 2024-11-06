import { UncontrolledBoard } from '@caldwell619/react-kanban';
import '@caldwell619/react-kanban/dist/styles.css';
import Button from 'components/Button/Button';
import CustomCard from 'components/Card';
// import Checkbox from 'components/FormElement/CheckBox';
import InputField from 'components/FormElement/InputField';
import TextArea from 'components/FormElement/TextArea';
import FilterIcon2 from 'components/Icon/assets/FilterIcon2';
import PlusIcon from 'components/Icon/assets/PlusIcon';
import Image from 'components/Image';
import { Modal } from 'components/Modal/Modal';
import PageHeader from 'components/PageHeader/PageHeader';
import ReactKanbanCard from 'components/ReactKanbanCard';
import ReactEditor from 'components/ReactQuillEditor/ReactQuillEditor';
import SearchComponent from 'components/Table/search';
import { Form, Formik } from 'formik';
import { useModal } from 'hooks/useModal';
import { customRandomNumberGenerator } from 'utils';
import './styles/index.css';

const board = {
  columns: [
    {
      id: 1,
      title: 'Backlog',
      cards: [
        {
          id: 1,
          card_id: 1,
          title: 'Card title 1',
          description: 'Card content',
        },
        {
          id: 2,
          card_id: 1,
          title: 'Card title 2',
          description: 'Card content',
        },
        {
          id: 3,
          card_id: 1,
          title: 'Card title 3',
          description: 'Card content',
        },
      ],
    },
    {
      id: 2,
      title: 'Doing',
      cards: [
        {
          id: 9,
          card_id: 2,
          title: 'Card title 9',
          description: 'Card content',
        },
      ],
    },
    {
      id: 3,
      title: 'Q&A',
      cards: [
        {
          id: 10,
          card_id: 3,
          title: 'Card title 10',
          description: 'Card content',
        },
        {
          id: 11,
          card_id: 3,
          title: 'Card title 11',
          description: 'Card content',
        },
      ],
    },
  ],
};

const ProjectManagementDetails = () => {
  const emailTemplateModule = useModal();
  const taskDetailsModal = useModal();

  return (
    <>
      <PageHeader text="Project Management" small>
        <div className="flex items-end gap-2">
          <SearchComponent placeholder="Search here.." />
          <Button
            onClickHandler={taskDetailsModal.openModal}
            variants="danger"
            className="flex gap-x-2"
          >
            Open Modal HELLO
          </Button>
        </div>
      </PageHeader>

      {taskDetailsModal.isOpen && (
        <Modal
          width="max-w-[1200px]"
          headerTitle="Mercedes - Well being Workshop"
          headerSubText="Due Date : 28/06/2020"
          modal={taskDetailsModal}
        >
          <>
            <div className="flex flex-wrap">
              <div className="w-full max-w-[calc(100%_-_357px)] pe-7">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-dark">Courses</p>
                  <Button className="gap-1" variants="primary">
                    <Image iconName="plusIcon" iconClassName="w-4 h-4" />
                    Add Course
                  </Button>
                </div>
                {/* Course List */}
                <div className="flex flex-col gap-2.5 mt-5">
                  <div className="bg-primaryLight p-5 rounded-xl">
                    <p className="text-base font-semibold text-dark">
                      First Aid Course Type B
                    </p>
                    <div className="mt-5 ">
                      <div className="grid grid-cols-1 lg:grid-cols-2 1800:grid-cols-4 gap-6">
                        <div className="flex flex-col gap-1.5">
                          <Button className="text-sm text-navText leading-6 inline-block">
                            Trainers Reached Out to
                          </Button>
                          <div className="flex flex-col gap-y-1">
                            <p className="text-sm font-medium text-dark">
                              Jacob Jones
                            </p>
                            <p className="text-sm font-medium text-dark">
                              Devon Lane
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Button className="text-sm text-navText leading-6 inline-block">
                            Assigned Trainer
                          </Button>
                          <p className="text-sm font-medium text-dark">
                            Cody Fisher
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Button className="text-sm text-navText leading-6 inline-block">
                            Course Revenue
                          </Button>
                          <p className="text-sm font-medium text-dark">$780.00</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Button className="text-sm text-navText leading-6 inline-block">
                            Assigned Traine&apos;s Fee
                          </Button>
                          <p className="text-sm font-medium text-dark">$450.00</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primaryLight p-5 rounded-xl">
                    <p className="text-base font-semibold text-dark">
                      First Aid Course Type B
                    </p>
                    <div className="mt-5 ">
                      <div className="grid grid-cols-1 lg:grid-cols-2 1800:grid-cols-4 gap-6">
                        <div className="flex flex-col gap-1.5">
                          <Button className="text-sm text-navText leading-6 inline-block">
                            Trainers Reached Out to
                          </Button>
                          <div className="flex flex-col gap-y-1">
                            <p className="text-sm font-medium text-dark">
                              Jacob Jones
                            </p>
                            <p className="text-sm font-medium text-dark">
                              Devon Lane
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Button className="text-sm text-navText leading-6 inline-block">
                            Assigned Trainer
                          </Button>
                          <p className="text-sm font-medium text-dark">
                            Cody Fisher
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Button className="text-sm text-navText leading-6 inline-block">
                            Course Revenue
                          </Button>
                          <p className="text-sm font-medium text-dark">$780.00</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Button className="text-sm text-navText leading-6 inline-block">
                            Assigned Traine&apos;s Fee
                          </Button>
                          <p className="text-sm font-medium text-dark">$450.00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-base font-semibold text-dark">My Notes</p>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="bg-primaryLight p-5 rounded-xl text-sm text-navText leading-6">
                      <Button>
                        Here, you can organize and review your course materials, jot
                        down key insights, and track your progress seamlessly. Use
                        this space to enhance your learning experience, making it a
                        personalized hub for your academic journey. Stay organized,
                        stay focused, and make the most of your educational endeavors
                        with 'My Notes'."Here, you can organize and review your
                        course materials, jot down key insights, and track your
                        progress seamlessly. Use this space to enhance your learning
                        experience, making it a personalized hub for your academic
                        journey.
                      </Button>
                    </div>
                    <div className="bg-primaryLight p-5 rounded-xl text-sm text-navText leading-6">
                      <Button>
                        Here, you can organize and review your course materials, jot
                        down key insights, and track your progress seamlessly. Use
                        this space to enhance your learning experience, making it a
                        personalized hub for your academic journey. Stay organized,
                        stay focused, and make the most of your educational endeavors
                        with 'My Notes'."Here, you can organize and review your
                        course materials, jot down key insights, and track your
                        progress seamlessly. Use this space to enhance your learning
                        experience, making it a personalized hub for your academic
                        journey.
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full max-w-[357px]">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-dark">Quotes</p>
                  <Button className="gap-1" variants="primary">
                    <Image iconName="plusIcon" iconClassName="w-4 h-4" />
                    Quote Creation
                  </Button>
                </div>
                {/* <p className="text-base font-semibold text-dark">Quotes</p> */}
                <div className="flex flex-col items-center justify-center pt-7 pb-5 px-5 bg-primaryLight rounded-xl mt-5">
                  <div className="max-h-[175px] mx-auto mb-8">
                    <Image
                      src="/images/no-quotes.svg"
                      imgClassName="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-base font-semibold text-dark mb-2">
                    No Quotes Yet!
                  </p>
                  <Button className="text-center block text-sm text-navText mb-5">
                    Ready to quotes? This space is waiting for your figures. Begin
                    now to plan and project.
                  </Button>
                  <Button variants="primary" className="gap-1">
                    <Image iconName="plusSquareIcon" iconClassName="w-4 h-4" />
                    Quote Creation
                  </Button>
                </div>

                <div className="mt-6">
                  <p className="text-base font-semibold text-dark">Pipeline</p>
                  <div className="bg-primaryLight py-7 px-5 flex flex-col justify-center items-center mt-2">
                    <Button className="gap-1" variants="secondary">
                      <Image iconName="eyeIcon" iconClassName="w-4 h-4" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="bg-primaryLight rounded-xl">
                <div className="comment-list flex flex-col gap-y-5 min-h-[160px] px-10 pt-8">
                  <div className="flex flex-wrap">
                    <div className="w-9 h-9">
                      <Image
                        src="https://placehold.co/150x150"
                        imgClassName="w-full h-full rounded-full"
                      />
                    </div>
                    <div className="max-w-[calc(100%_-_36px)] ps-3">
                      <p className="text-base leading-4 text-dark font-normal">
                        Thank you! Let me know when it done.
                      </p>
                      <p className="text-sm leading-3 text-grayText font-light mt-2">
                        3:49 PM
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap">
                    <div className="w-9 h-9">
                      <Image
                        src="https://placehold.co/150x150"
                        imgClassName="w-full h-full rounded-full"
                      />
                    </div>
                    <div className="max-w-[calc(100%_-_36px)] ps-3">
                      <p className="text-base leading-4 text-dark font-normal">
                        Thank you! Let me know when it done.
                      </p>
                      <p className="text-sm leading-3 text-grayText font-light mt-2">
                        3:49 PM
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-2.5 px-5 select-none flex items-center gap-x-3">
                  <Formik
                    initialValues={{ email: '' }}
                    onSubmit={() => {
                      // add logic
                    }}
                  >
                    <Form className="flex gap-4 w-full px-4 py-3 border-t border-solid border-gray-300 bg-white">
                      <div className="w-full flex-[1_0_0%] ">
                        <InputField
                          name="email"
                          className="!border-0 !bg-transparent focus:!ring-transparent focus:!ring-offset-0 focus:!ring-0 !rounded-none"
                          placeholder="Enter academy name"
                        />
                      </div>
                      <Button
                        variants="primary"
                        className="w-12 h-12 inline-block"
                        type="submit"
                      >
                        <Image iconName="sendIcon" iconClassName="w-full h-full" />
                      </Button>
                    </Form>
                  </Formik>
                </div>
              </div>
            </div>
          </>
        </Modal>
      )}

      <h1 className="text-4xl rounded-xl py-10 text-danger text-center my-5 border-2 border-solid border-danger">
        PLEASE DO NOT REFER BELOW CODE..!
      </h1>

      <PageHeader text="Project Management" small>
        <div className="flex items-end gap-2">
          <Button
            onClickHandler={emailTemplateModule.openModal}
            variants="danger"
            className="flex gap-x-2"
          >
            Open Modal
          </Button>
          <div className="relative group">
            <Button variants="primary" className="flex gap-x-2">
              <span className="w-5 h-5 inline-block">
                <FilterIcon2 className="w-full h-full" />
              </span>
              {/* added  due to Yellow line in sonar lint  */}
              Filter
            </Button>
            {/*  before:content-[''] before:w-5 before:h-5 before:bg-white before:rotate-45 before:right-5 before:-top-2  */}
            <div className="opacity-0 pointer-events-none translate-y-4 group-hover:translate-y-0 group-hover:pointer-events-auto group-hover:opacity-100 absolute top-full right-0 before:absolute transition-all duration-300">
              <div className="bg-white rounded-xl shadow-xl w-[245px]">
                <div className="px-5 py-3.5 border-b border-solid border-offWhite">
                  <h5 className="text-base leading-5 font-semibold text-dark">
                    Filter
                  </h5>
                </div>
                <div className="px-5 py-3">
                  <div className="">
                    <p className="text-sm leading-5 font-semibold">Members</p>
                    <div className="flex flex-col gap-y-3 mt-4">
                      <div className="flex items-center gap-x-2">
                        {/* <Checkbox name="sd" /> */}
                        <label className="text-sm left-4 text-dark ">
                          {/* <Checkbox name="sd" /> */}
                          No Member
                        </label>
                      </div>
                      {/* <Checkbox name="sd" text="Cards assign to me" /> */}
                    </div>
                  </div>
                  <div className="">
                    <p className="text-sm leading-5 font-semibold mt-5 pt-5 border-t border-solid border-offWhite">
                      Members
                    </p>
                    <div className="flex flex-col gap-y-3 mt-4">
                      <div className="flex items-center gap-x-2">
                        {/* <Checkbox name="sd" /> */}
                        <label className="text-sm left-4 text-dark ">
                          {/* <Checkbox name="sd" /> */}
                          No Member
                        </label>
                      </div>
                      {/* <Checkbox name="sd" text="Cards assign to me" /> */}
                    </div>
                  </div>
                  <div className="">
                    <p className="text-sm leading-5 font-semibold mt-5 pt-5 border-t border-solid border-offWhite">
                      Members
                    </p>
                    <div className="flex flex-col gap-y-3 mt-4">
                      <div className="flex items-center gap-x-2">
                        {/* <Checkbox name="sd" /> */}
                        <div className="text-sm left-4 text-dark bg-ic_4 py-3 px-4 max-w-[calc(100%_-_20px)] w-full rounded-md" />
                      </div>
                      {/* <Checkbox name="sd" text="Cards assign to me" /> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <span className="bg-ic_2/30 text-danger px-3 py-2.5 font-medium text-sm leading-5 rounded-md">
            Due Date: 20.04.2023
          </span>
        </div>
      </PageHeader>
      {emailTemplateModule.isOpen && (
        <Modal
          headerSubText="in list Date requested"
          headerTitle="Email Templates Module"
          modal={emailTemplateModule}
        >
          <div className="flex flex-wrap">
            <div className="max-w-[calc(100%_-_170px)] w-full">
              <div className="flex flex-wrap gap-5 xl:gap-7 2xl:gap-10">
                <div className="">
                  <span className="block w-full text-sm leading-4 text-grayText mb-2.5">
                    Members
                  </span>
                  <div className="member-wrapper flex flex-wrap items-center gap-1">
                    <div className="flex">
                      <div className="w-9 h-9 rounded-full first:ms-0 -ms-4 shadow-md shadow-dark/20 ring-2 ring-white hover:z-1 relative group">
                        <Image
                          src="/images/member.png"
                          width={40}
                          height={40}
                          imgClassName="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div className="w-9 h-9 rounded-full first:ms-0 -ms-4 shadow-md shadow-dark/20 ring-2 ring-white hover:z-1 relative group">
                        <Image
                          src="/images/member.png"
                          width={40}
                          height={40}
                          imgClassName="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div className="w-9 h-9 rounded-full first:ms-0 -ms-4 shadow-md shadow-dark/20 ring-2 ring-white hover:z-1 relative group">
                        <Image
                          src="/images/member.png"
                          width={40}
                          height={40}
                          imgClassName="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div className="w-9 h-9 rounded-full first:ms-0 -ms-4 shadow-md shadow-dark/20 ring-2 ring-white hover:z-1 relative group">
                        <Image
                          src="/images/member.png"
                          width={40}
                          height={40}
                          imgClassName="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div className="w-9 h-9 rounded-full first:ms-0 -ms-4 shadow-md shadow-dark/20 ring-2 ring-white bg-white hover:z-1 relative group">
                        <span className="inline-flex justify-center items-center bg-authBG text-primary font-medium text-sm w-full h-full rounded-full">
                          3
                        </span>
                      </div>
                    </div>
                    <Button
                      className="!p-2 w-9 h-9 !rounded-full"
                      variants="whiteBordered"
                    >
                      <Image iconName="plusIcon" />
                    </Button>
                  </div>
                </div>
                <div className="">
                  <span className="block w-full text-sm leading-4 text-grayText mb-2.5">
                    Labels
                  </span>
                  <div className="flex items-center flex-wrap gap-2">
                    <Button variants="green" small>
                      Green
                    </Button>
                    <Button variants="purple" small>
                      Design
                    </Button>
                    <Button className="w-9 h-9 !p-2 " variants="whiteBordered">
                      <PlusIcon className="w-full h-full" />
                    </Button>
                  </div>
                </div>
              </div>

              <Formik
                initialValues={{ ssd: '', quill: '' }}
                onSubmit={() => {
                  // handle submit.
                }}
              >
                {() => (
                  <Form>
                    <div className="mt-12 flex flex-col gap-3">
                      <TextArea name="ssd" label="Description" />
                      <ReactEditor
                        label="Activity"
                        name="quill"
                        value=""
                      // id="editor"
                      />

                      <div className="flex justify-start gap-3">
                        <Button
                          className="min-w-[75px] justify-center"
                          variants="primary"
                        >
                          Save
                        </Button>
                        <Button
                          className="min-w-[75px] justify-center"
                          variants="whiteBordered"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>

              <div className="mt-7">
                <div className="flex flex-col gap-y-5">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src="/images/member.png"
                        width={32}
                        height={32}
                        imgClassName="w-full h-full object-cover"
                      />
                    </div>
                    <div className="max-w-[calc(100%_-_32px)] ps-2">
                      <p className="text-sm text-black leading-4">
                        <strong className="font-semibold text-dark">
                          James Martine
                        </strong>{' '}
                        added this card to Date confirmed
                      </p>
                      <span className="block text-grayText text-xs leading-4 mt-1">
                        a 5 minutes ago
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src="/images/member.png"
                        width={32}
                        height={32}
                        imgClassName="w-full h-full object-cover"
                      />
                    </div>
                    <div className="max-w-[calc(100%_-_32px)] ps-2">
                      <p className="text-sm text-black leading-4">
                        <strong className="font-semibold text-dark">
                          James Martine
                        </strong>{' '}
                        added this card to Date confirmed
                      </p>
                      <span className="block text-grayText text-xs leading-4 mt-1">
                        a 5 minutes ago
                      </span>
                    </div>
                  </div>

                  <Button className="w-fit text-sm text-primary underline underline-offset-4 font-medium hover:opacity-70">
                    Show More
                  </Button>
                </div>
              </div>
            </div>
            <div className="max-w-[150px] w-full flex flex-col gap-y-6 ms-auto">
              <div className="flex flex-col gap-y-3">
                <span className="text-sm text-dark">Add to card</span>
                <Button
                  className="flex gap-1.5 !text-grayText !px-2 !font-normal"
                  variants="whiteBordered"
                >
                  <span className="w-4 h-4 inline-block">
                    <Image iconName="userjoinIcon" iconClassName="w-full h-full" />
                  </span>
                  {/* added  due to Yellow line in sonar lint  */}
                  Join
                </Button>
                <Button
                  className="flex gap-1.5 !text-grayText !px-2 !font-normal"
                  variants="whiteBordered"
                >
                  <span className="w-4 h-4 inline-block">
                    <Image iconName="userGroupIcon" iconClassName="w-full h-full" />
                  </span>
                  {/* added  due to Yellow line in sonar lint  */}
                  Members
                </Button>
                <div className="relative z-1">
                  <Button
                    className="flex gap-1.5 !text-grayText !px-2 !font-normal"
                    variants="whiteBordered"
                  >
                    <span className="w-4 h-4 inline-block">
                      <Image iconName="bookmarkIcon" iconClassName="w-full h-full" />
                    </span>
                    {/* added  due to Yellow line in sonar lint  */}
                    Labels
                  </Button>
                </div>

                <div className="relative">
                  <Button
                    className="flex gap-1.5 !text-grayText !px-2 !font-normal"
                    variants="whiteBordered"
                  >
                    <span className="w-4 h-4 inline-block">
                      <Image iconName="linkIcon" iconClassName="w-full h-full" />
                    </span>
                    {/* added  due to Yellow line in sonar lint  */}
                    Attachment
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-y-3">
                <span className="text-sm text-dark">Actions</span>
                <Button
                  className="flex gap-1.5 !text-grayText !px-2 !font-normal"
                  variants="whiteBordered"
                >
                  <span className="w-4 h-4 inline-block">
                    <Image iconName="sendSquareIcon" iconClassName="w-full h-full" />
                  </span>
                  {/* added  due to Yellow line in sonar lint  */}
                  Move
                </Button>
                <Button
                  className="flex gap-1.5 !text-grayText !px-2 !font-normal"
                  variants="whiteBordered"
                >
                  <span className="w-4 h-4 inline-block">
                    <Image iconName="copyIcon" iconClassName="w-full h-full" />
                  </span>
                  {/* added  due to Yellow line in sonar lint  */}
                  Copy
                </Button>
                <Button
                  className="flex gap-1.5 !text-grayText !px-2 !font-normal"
                  variants="whiteBordered"
                >
                  <span className="w-4 h-4 inline-block">
                    <Image iconName="mailIcon" iconClassName="w-full h-full" />
                  </span>
                  {/* added  due to Yellow line in sonar lint  */}
                  Send Email
                </Button>
                <Button
                  className="!px-2.5 !font-normal text-center justify-center !bg-primary/10"
                  variants="primaryBordered"
                >
                  Create Quote
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex flex-col gap-y-7">
        <CustomCard minimal title="My Notes">
          <p>
            Here, you can organize and review your course materials, jot down key
            insights, and track your progress seamlessly. Use this space to enhance
            your learning experience, making it a personalized hub for your academic
            journey. Stay organized, stay focused, and make the most of your
            educational endeavors with 'My Notes'."Here, you can organize and review
            your course materials, jot down key insights, and track your progress
            seamlessly. Use this space to enhance your learning experience, making it
            a personalized hub for your academic journey.
          </p>
        </CustomCard>

        <CustomCard minimal title="The Courses">
          <>
            <div className="table-list mb-7 last:mb-0">
              <p className="text-base text-primary font-semibold mb-4">
                First Aid Course Type B
              </p>
              <div className="">table goes here</div>
            </div>
            <div className="table-list mb-7 last:mb-0">
              <p className="text-base text-primary font-semibold mb-4">
                First Aid Course Type B
              </p>
              <div className="">table goes here</div>
            </div>
          </>
        </CustomCard>
        <CustomCard minimal title="Pipeline">
          <UncontrolledBoard
            initialBoard={board}
            renderCard={(card) => (
              // <ReactKanbanCard card={card} />
              <ReactKanbanCard cardType="projectCard" card={card} />
            )}
            renderColumnHeader={({ title, cards }, { removeColumn }) => {
              return (
                <div
                  className="kdghiu"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div className="subtitle2">
                    {title} {cards.length}
                  </div>
                  <div className="relative group">
                    <Button className="w-5 h-5">
                      <Image iconName="threeDotVerticalIcon" />
                    </Button>
                    <div className="translate-y-4 opacity-0 pointer-events-none group-hover:-translate-y-px group-hover:opacity-100 group-hover:pointer-events-auto  absolute top-full flex flex-col gap-y-1 bg-white min-w-[150px] right-0 p-2 rounded-lg shadow-xl border border-solid border-gray-200 transition-all duration-500 after:absolute after:w-full after:h-4 after:bottom-full after:right-0">
                      <div className="">
                        <Button className="flex hover:bg-primary hover:text-white py-2 px-2 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 w-full">
                          Edit
                        </Button>
                      </div>
                      <div className="">
                        <Button
                          onClickHandler={removeColumn}
                          className="w-full select-none hover:bg-red-500 text-red-500 hover:text-white  py-2 px-2 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
            allowAddColumn
            renderColumnAdder={({ addColumn }) => {
              return (
                <div className="react-kanban-column_add-column">
                  <Button
                    className="flex font-medium items-center justify-center gap-2 w-full"
                    onClickHandler={() =>
                      addColumn({
                        id: customRandomNumberGenerator(),
                        title: 'Title',
                        cards: [],
                      })
                    }
                  >
                    <span className="w-5 h-5 block">
                      <Image iconName="plusIcon" />
                    </span>
                    {/* added  due to Yellow line in sonar lint  */}
                    Add column
                  </Button>
                </div>
              );
            }}
          />
        </CustomCard>

        <CustomCard minimal title="Quotes">
          <div className="flex text-center justify-center items-center flex-col max-w-[366px] mx-auto pb-4">
            <div className="max-w-[300px]">
              <Image
                src="/images/no_quotes.svg"
                imgClassName="w-full h-full object-contain"
              />
            </div>
            <p className="mt-5 text-base font-bold mb-2">No Quotes Yet!</p>
            <span className="text-sm text-grayText font-normal mb-4">
              Ready to quotes? This space is waiting for your figures. Begin now to
              plan and project.
            </span>
            <Button variants="primary" className="flex items-center gap-2">
              <span className="w-4 h-4 block">
                <Image iconName="plusSquareIcon" />
              </span>
              {/* added  due to Yellow line in sonar lint  */}
              Quote Creation
            </Button>
          </div>
        </CustomCard>
      </div>
    </>
  );
};

export default ProjectManagementDetails;
