import React from 'react';
import { getAvatarUrl } from '../../utils/getAvatarUrl';

/**
 * UserAvatar Component
 * 
 * A unified avatar component for users across the application.
 * 
 * @param {Object} props
 * @param {Object} props.user - User object with name and avatar
 * @param {string} props.size - Size (xs, sm, md, lg, xl, xxl, giant)
 * @param {string} props.className - Additional classes
 */
const UserAvatar = ({ user, size = 'md', className = '' }) => {
  const avatarUrl = getAvatarUrl(user?.avatar);
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : user?.initials || '?';

  const sizeClass = `avatar-${size}`;

  return (
    <div
      className={`user-avatar ${sizeClass} ${className}`}
      title={user?.name || 'User'}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user?.name || 'User'}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
          }}
        />
      ) : null}
      <span
        className="user-avatar-initials"
        style={{ display: avatarUrl ? 'none' : 'flex' }}
      >
        {initials}
      </span>
    </div>
  );
};

export default UserAvatar;
