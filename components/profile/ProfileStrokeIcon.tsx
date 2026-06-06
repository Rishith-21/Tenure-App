import React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';

export type ProfileStrokeIconName =
  | 'edit'
  | 'settings'
  | 'chevron'
  | 'check'
  | 'pin'
  | 'star'
  | 'shield'
  | 'eye'
  | 'plus';

type Props = {
  name: ProfileStrokeIconName;
  color: string;
  size?: number;
  strokeWidth?: number;
};

const ProfileStrokeIcon = ({
  name,
  color,
  size = 18,
  strokeWidth = 1.75,
}: Props) => {
  const s = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'edit' && <Path d="M4 16.5 15 5.5l3.5 3.5L7.5 20H4v-3.5Z M13 7.5l3.5 3.5" {...s} />}
      {name === 'settings' && (
        <>
          <Circle cx={12} cy={12} r={2.8} {...s} />
          <Path
            d="M12 2.8v2.2M12 19v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.8 12h2.2M19 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"
            {...s}
          />
        </>
      )}
      {name === 'chevron' && <Path d="M9 6l6 6-6 6" {...s} />}
      {name === 'check' && <Path d="M5 12.5l4.2 4.2L19 7" {...s} />}
      {name === 'pin' && (
        <>
          <Path d="M12 20.5s6-5.1 6-10.1A6 6 0 0 0 6 10.4c0 5 6 10.1 6 10.1Z" {...s} />
          <Circle cx={12} cy={10.2} r={2.2} {...s} />
        </>
      )}
      {name === 'star' && (
        <Path
          d="M12 4.2l2.3 4.8 5.2.7-3.8 3.6.9 5.2-4.6-2.5-4.6 2.5.9-5.2-3.8-3.6 5.2-.7L12 4.2Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          fill={color}
        />
      )}
      {name === 'shield' && (
        <Path d="M12 3.2l6.5 2.6v5c0 4.3-2.8 7.2-6.5 8.6-3.7-1.4-6.5-4.3-6.5-8.6v-5L12 3.2Z" {...s} />
      )}
      {name === 'eye' && (
        <>
          <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...s} />
          <Circle cx={12} cy={12} r={2.6} {...s} />
        </>
      )}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...s} />}
    </Svg>
  );
};

export default React.memo(ProfileStrokeIcon);
