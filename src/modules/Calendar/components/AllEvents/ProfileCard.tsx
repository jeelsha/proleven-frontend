import NameBadge from 'components/Badge/NameBadge';
import Button from 'components/Button/Button';
import Image from 'components/Image';
import { ProfileCardProps } from 'modules/Calendar/types';

export const ProfileCard = ({ profileData, title }: ProfileCardProps) => {
  return (
    <div className="flex flex-col gap-2.5">
      <Button className="block text-xs text-navText">{title}</Button>
      <div className="flex items-center gap-1">
        <div className="inline-block w-8 h-8 rounded-full overflow-hidden">
          {profileData?.profile_image ? (
            <Image
              src={profileData?.profile_image}
              imgClassName="w-full h-full object-cover"
              width={36}
              height={36}
              alt={profileData ? `${profileData?.full_name} ` : 'Profile Image'}
              serverPath
            />
          ) : (
            <NameBadge
              FirstName={profileData?.first_name}
              LastName={profileData?.last_name}
            />
          )}
        </div>
        <p className="text-sm leading-5 text-dark">{profileData?.full_name}</p>
      </div>
    </div>
  );
};
