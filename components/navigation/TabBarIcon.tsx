import React from 'react';
import Svg, {Path, Circle} from 'react-native-svg';

export type TabIconName = 'Home' | 'Explore' | 'Requests' | 'Alerts' | 'Profile';

type Props = {
  name: TabIconName;
  color: string;
  size?: number;
  focused?: boolean;
};

const TabBarIcon = ({name, color, size = 22, focused = false}: Props) => {
  const stroke = focused ? 2.25 : 1.75;

  switch (name) {
    case 'Home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 10.2 12 4l8 6.2V19a1.2 1.2 0 0 1-1.2 1.2H15v-5.8H9V20.2H5.2A1.2 1.2 0 0 1 4 19V10.2Z"
            stroke={color}
            strokeWidth={stroke}
            strokeLinejoin="round"
            fill={focused ? color : 'none'}
            fillOpacity={focused ? 0.14 : 0}
          />
        </Svg>
      );
    case 'Explore':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 21s6.5-5.6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.4 6.5 11 6.5 11Z"
            stroke={color}
            strokeWidth={stroke}
            strokeLinejoin="round"
            fill={focused ? color : 'none'}
            fillOpacity={focused ? 0.14 : 0}
          />
          <Circle
            cx={12}
            cy={10}
            r={2.4}
            stroke={color}
            strokeWidth={stroke}
            fill={focused ? color : 'none'}
            fillOpacity={focused ? 0.5 : 0}
          />
        </Svg>
      );
    case 'Requests':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4 3v-3H5a1.5 1.5 0 0 1-1.5-1.5V8A1.5 1.5 0 0 1 5 6.5Z"
            stroke={color}
            strokeWidth={stroke}
            strokeLinejoin="round"
            fill={focused ? color : 'none'}
            fillOpacity={focused ? 0.12 : 0}
          />
        </Svg>
      );
    case 'Alerts':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 4.5a4.5 4.5 0 0 0-4.5 4.5v2.6L5.8 14.8h12.4l-1.7-3.2V9A4.5 4.5 0 0 0 12 4.5Z"
            stroke={color}
            strokeWidth={stroke}
            strokeLinejoin="round"
          />
          <Path
            d="M10 17.2h4a2 2 0 0 1-4 0Z"
            stroke={color}
            strokeWidth={stroke}
            strokeLinejoin="round"
          />
          {focused ? (
            <Circle cx={17.2} cy={7.2} r={2.2} fill={color} />
          ) : null}
        </Svg>
      );
    case 'Profile':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle
            cx={12}
            cy={8.2}
            r={3.2}
            stroke={color}
            strokeWidth={stroke}
            fill={focused ? color : 'none'}
            fillOpacity={focused ? 0.14 : 0}
          />
          <Path
            d="M6.2 19.5c.8-2.8 3-4.5 5.8-4.5s5 1.7 5.8 4.5"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        </Svg>
      );
    default:
      return null;
  }
};

export default TabBarIcon;
