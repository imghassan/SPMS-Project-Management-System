// Project Dashboard - Memeber Avatars
import React from 'react';
import { getAvatarUrl } from '../../utils/getAvatarUrl';


const AVATAR_COLORS = [
  '#00d4d4', '#f5a623', '#4caf50', '#a78bfa', '#f87171', '#34d399', '#60a5fa',
];

const MemberAvatars = ({ assignees = [], max = 3 }) => {
  const shown = assignees.slice(0, max);
  const extra = assignees.length - shown.length;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((a, idx) => {
        const initials = (a?.name || '?')
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        const avatarSrc = getAvatarUrl(a?.avatarUrl || a?.avatar);
        const hasImg = !!avatarSrc;
        const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];


        return (
          <div
            key={`${a?.name || 'av'}-${idx}`}
            title={a?.name}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: '2px solid #0f2020',
              background: hasImg ? '#0f2020' : `${color}22`,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: idx === 0 ? 0 : -8,
              flexShrink: 0,
              position: 'relative',
              zIndex: max - idx,
            }}
          >
            {hasImg ? (
              <>
                <img
                  src={avatarSrc}
                  alt={a?.name || 'User avatar'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
                <span
                  style={{
                    display: 'none',
                    color,
                    fontWeight: 800,
                    fontSize: 10,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {initials}
                </span>
              </>
            ) : (

              <span
                style={{
                  color,
                  fontWeight: 800,
                  fontSize: 10,
                  letterSpacing: '-0.02em',
                }}
              >
                {initials}
              </span>
            )}
          </div>
        );
      })}
      {extra > 0 && (
        <div
          title={`${extra} more member${extra > 1 ? 's' : ''}`}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '2px solid #0f2020',
            background: 'rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: -8,
            color: '#6a9090',
            fontWeight: 800,
            fontSize: 10,
            flexShrink: 0,
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
};

export default MemberAvatars;
