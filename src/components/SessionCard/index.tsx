import Button from 'components/Button/Button';
import Image from 'components/Image';

const SessionCard = () => {
  return (
    <div className="bg-primaryLight p-5 rounded-lg">
      <p className="text-lg font-semibold leading-[1.5]">
        <Button className="w-5 inline-block">1.</Button>
        Session
      </p>
      <div className="ps-5">
        <Button className="block text-xs text-navText mt-1">
          08:30:00 AM - 10:02:00 AM
        </Button>

        <div className="mt-6">
          <Button className="block text-xs text-navText mb-2">Link</Button>
          <div className="border border-solid border-primary/5 bg-primary/5 px-5 py-2 flex gap-2.5 rounded-lg items-center">
            <Image iconName="linkIcon" iconClassName="w-4 h-4 text-primary/50" />
            <Button className="flex-[1_0_0%] inline-block truncate text-sm text-primary/50 text-center">
              https://teamslinkfordemolinkteamslinkfordemolinkteam
            </Button>
            <Image
              iconName="copyIcon"
              iconClassName="w-4 h-4 text-primary cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
