import React from 'react';
import Svg, { Path, Polyline } from 'react-native-svg';

// למה לא @expo/vector-icons:
// הוא נשען על קובץ גופן שמגיע ברשת מנתיב שכולל node_modules. באירוח
// הסטטי הקובץ לא הוגש, וכל האייקונים הופיעו כריבועים ריקים. כאן הצורות
// מצוירות בקוד - שום דבר לא נטען מהרשת, אז אין מה שיישבר.

const SHAPES = {
  check: (c, w) => (
    <Polyline
      points="20 6 9 17 4 12"
      fill="none"
      stroke={c}
      strokeWidth={w + 0.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  star: (c) => (
    <Path
      d="M12 2.6l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.4l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94z"
      fill={c}
      stroke={c}
      strokeWidth={1}
      strokeLinejoin="round"
    />
  ),
  'star-outline': (c, w) => (
    <Path
      d="M12 2.6l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.4l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94z"
      fill="none"
      stroke={c}
      strokeWidth={w}
      strokeLinejoin="round"
    />
  ),
  trash: (c, w) => (
    <>
      <Polyline points="3 6 5 6 21 6" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <Path
        d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"
        fill="none"
        stroke={c}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M10 11v6M14 11v6" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" />
    </>
  ),
  home: (c, w) => (
    <Path
      d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"
      fill="none"
      stroke={c}
      strokeWidth={w}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  ),
  settings: (c, w) => (
    <>
      <Path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
        fill="none"
        stroke={c}
        strokeWidth={w}
      />
      <Path
        d="M20.3 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-2.88 1.2V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-2.88-1.2l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0-1.2-2.88H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 2.88-1.2V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 2.88 1.2l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0 1.2 2.88H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.57 1.05z"
        fill="none"
        stroke={c}
        strokeWidth={w}
        strokeLinejoin="round"
      />
    </>
  ),
  person: (c, w) => (
    <>
      <Path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="none" stroke={c} strokeWidth={w} />
      <Path
        d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"
        fill="none"
        stroke={c}
        strokeWidth={w}
        strokeLinecap="round"
      />
    </>
  ),
  cloud: (c, w) => (
    <Path
      d="M18 17H7A4 4 0 1 1 7.6 9a5.5 5.5 0 0 1 10.6 2A3 3 0 0 1 18 17z"
      fill="none"
      stroke={c}
      strokeWidth={w}
      strokeLinejoin="round"
    />
  ),
};

export default function Icon({ name, size = 20, color = '#FFFFFF', strokeWidth = 1.8 }) {
  const shape = SHAPES[name];
  if (!shape) return null;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {shape(color, strokeWidth)}
    </Svg>
  );
}
