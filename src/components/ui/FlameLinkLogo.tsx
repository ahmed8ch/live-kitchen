import React, { useId } from 'react';

interface FlameLinkLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  variant?: 'default' | 'on-dark' | 'monochrome';
}

export const FlameMark: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => {
  const rawId = useId();
  const id = `fl_${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg
      className={`${className} transition-all duration-300 ease-out group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(255,0,85,0.6)] transform-gpu`}
      viewBox="0 0 2650 3429"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}_paint0`}
          x1="1003.45"
          y1="92.6875"
          x2="1003.45"
          y2="3338.7"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF0055" />
          <stop offset="0.5" stopColor="#B3335E" />
          <stop offset="1" stopColor="#20221F" />
        </linearGradient>

        <linearGradient
          id={`${id}_p1`}
          x1="1057.67"
          y1="-2989.08"
          x2="2602.76"
          y2="-2989.08"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <linearGradient
          id={`${id}_p2`}
          x1="1623.31"
          y1="-1214.61"
          x2="2392.3"
          y2="-1214.61"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <linearGradient
          id={`${id}_p3`}
          x1="1437.32"
          y1="-1646.42"
          x2="2495.8"
          y2="-1646.42"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <linearGradient
          id={`${id}_p4`}
          x1="1247.06"
          y1="-2078.16"
          x2="2577.26"
          y2="-2078.16"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <linearGradient
          id={`${id}_p5`}
          x1="1327.91"
          y1="-2622.15"
          x2="2606.6"
          y2="-2622.15"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <linearGradient
          id={`${id}_p6`}
          x1="1367.69"
          y1="-2758.82"
          x2="2646.38"
          y2="-2758.82"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <linearGradient
          id={`${id}_p7`}
          x1="1404.98"
          y1="-2805.19"
          x2="2665.91"
          y2="-2805.19"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <linearGradient
          id={`${id}_p8`}
          x1="1404.98"
          y1="-2854.01"
          x2="2665.91"
          y2="-2854.01"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <linearGradient
          id={`${id}_p9`}
          x1="1361.57"
          y1="-2901.84"
          x2="2658.02"
          y2="-2901.84"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <linearGradient
          id={`${id}_p10`}
          x1="1247.84"
          y1="-2939.91"
          x2="2633.09"
          y2="-2939.91"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <linearGradient
          id={`${id}_p11`}
          x1="873.621"
          y1="-2851.47"
          x2="2560.79"
          y2="-2851.47"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <linearGradient
          id={`${id}_p12`}
          x1="740.952"
          y1="-2713.9"
          x2="2481.4"
          y2="-2713.9"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <linearGradient
          id={`${id}_p13`}
          x1="680.444"
          y1="-2387.39"
          x2="2385.37"
          y2="-2387.39"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <linearGradient
          id={`${id}_p14`}
          x1="704.336"
          y1="-2059.2"
          x2="2249.42"
          y2="-2059.2"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <linearGradient
          id={`${id}_p15`}
          x1="802.236"
          y1="-1543.1"
          x2="2063.17"
          y2="-1543.1"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <linearGradient
          id={`${id}_p16`}
          x1="1002.89"
          y1="-660.595"
          x2="1802.07"
          y2="-660.595"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA074D" />
          <stop offset="0.52" stopColor="#DE084F" />
          <stop offset="0.82" stopColor="#E50953" />
          <stop offset="1" stopColor="#F50757" />
        </linearGradient>

        <clipPath id={`${id}_clip`}>
          <rect width="2650" height="3429" fill="white" />
        </clipPath>

        <path
          id={`${id}_stroke`}
          d="M1261.71 92.6875C1239.62 234.096 1173.17 364.831 1071.95 466.033L498.823 1039.09C317.799 1220.08 191.931 1448.77 135.879 1698.53C79.8273 1948.29 95.8998 2208.83 182.224 2449.8C268.548 2690.78 421.571 2902.27 623.468 3059.64C825.366 3217.02 1067.83 3313.79 1322.61 3338.7C1281.3 3219 1274.48 3090.1 1302.93 2966.7C1331.37 2843.31 1393.94 2730.4 1483.48 2640.85L1733.31 2391.05C1836.11 2288.29 1896.73 2150.77 1903.23 2005.56C1909.73 1860.36 1861.64 1717.97 1768.43 1606.44L1182.21 2192.69C1153.95 2220.95 1115.61 2236.83 1075.64 2236.83C1035.67 2236.83 997.333 2220.95 969.069 2192.69C940.804 2164.43 924.925 2126.1 924.925 2086.13C924.925 2046.16 940.804 2007.83 969.069 1979.57L1704 1244.83C1796.37 1152.51 1859.98 1035.39 1887.15 907.656C1914.31 779.925 1903.86 647.059 1857.06 525.144C1810.26 403.229 1729.11 297.494 1623.45 220.741C1517.79 143.988 1392.14 99.5085 1261.71 92.6875Z"
        />

        <mask
          id={`${id}_mask`}
          style={{ maskType: 'luminance' }}
          maskUnits="userSpaceOnUse"
          x="-208"
          y="-104"
          width="3118"
          height="3637"
        >
          <path d="M2909.8 -103.906H-207.843V3532.91H2909.8V-103.906Z" fill="white" />
          <path
            d="M1910.69 908.5L2000.29 913.476V917.457L1910.69 922.433C1909.77 922.433 1908.86 922.253 1908.02 921.903C1907.17 921.553 1906.41 921.039 1905.76 920.393C1905.11 919.746 1904.6 918.978 1904.25 918.133C1903.9 917.287 1903.72 916.381 1903.72 915.467C1903.72 914.552 1903.9 913.646 1904.25 912.801C1904.6 911.955 1905.11 911.188 1905.76 910.541C1906.41 909.894 1907.17 909.38 1908.02 909.03C1908.86 908.68 1909.77 908.5 1910.69 908.5Z"
            fill="#FF0055"
          />
          <path
            d="M2026.47 922.406L969.069 1979.58L1182.21 2192.7L2239.61 1135.42L2026.47 922.406Z"
            fill="black"
          />
        </mask>
      </defs>

      <g clipPath={`url(#${id}_clip)`}>
        <use href={`#${id}_stroke`} xlinkHref={`#${id}_stroke`} fill="#FF0055" />
        <use
          href={`#${id}_stroke`}
          xlinkHref={`#${id}_stroke`}
          fill={`url(#${id}_paint0)`}
          fillOpacity="0.2"
        />

        <g mask={`url(#${id}_mask)`}>
          <path d="M1590 2460.37L2494.12 2487.38V2493.62L1590 2520.63V2460.37Z" fill={`url(#${id}_p1)`} />
          <path
            d="M1901.76 1228.21L2338.24 1238.6V1244.84L1901.76 1255.23C1898.18 1255.23 1894.75 1253.8 1892.21 1251.27C1889.68 1248.74 1888.25 1245.3 1888.25 1241.72C1888.25 1238.14 1889.68 1234.7 1892.21 1232.17C1894.75 1229.63 1898.18 1228.21 1901.76 1228.21Z"
            fill={`url(#${id}_p2)`}
          />
          <path
            d="M1818.63 1360.17L2421.37 1373.68V1379.91L1818.63 1393.42C1814.22 1393.42 1809.99 1391.67 1806.87 1388.55C1803.75 1385.44 1802 1381.21 1802 1376.8C1802 1372.39 1803.75 1368.16 1806.87 1365.04C1809.99 1361.92 1814.22 1360.17 1818.63 1360.17Z"
            fill={`url(#${id}_p3)`}
          />
          <path
            d="M1725.1 1492.14L2483.73 1508.77V1515L1725.1 1531.63C1722.51 1531.63 1719.94 1531.12 1717.54 1530.12C1715.15 1529.13 1712.97 1527.68 1711.14 1525.84C1709.3 1524.01 1707.85 1521.83 1706.86 1519.44C1705.86 1517.04 1705.35 1514.48 1705.35 1511.88C1705.35 1509.29 1705.86 1506.72 1706.86 1504.33C1707.85 1501.93 1709.3 1499.76 1711.14 1497.92C1712.97 1496.09 1715.15 1494.64 1717.54 1493.64C1719.94 1492.65 1722.51 1492.14 1725.1 1492.14Z"
            fill={`url(#${id}_p4)`}
          />
          <path d="M1768.46 1605.86L2516.69 1625.6V1631.84L1768.46 1652.62V1605.86Z" fill={`url(#${id}_p5)`} />
          <path d="M1808.24 1751.07L2556.47 1771.85V1778.09L1808.24 1800.95V1751.07Z" fill={`url(#${id}_p6)`} />
          <path d="M1839.41 1892.59L2577.26 1914.41V1920.65L1839.41 1944.55V1892.59Z" fill={`url(#${id}_p7)`} />
          <path d="M1839.41 2031.7L2577.26 2055.59V2061.83L1839.41 2085.73V2031.7Z" fill={`url(#${id}_p8)`} />
          <path d="M1808.24 2171.77L2566.86 2196.7V2202.94L1808.24 2227.88V2171.77Z" fill={`url(#${id}_p9)`} />
          <path d="M1725.1 2321.62L2535.69 2347.59V2353.83L1725.1 2379.81V2321.62Z" fill={`url(#${id}_p10)`} />
          <path d="M1454.9 2597.95L2442.16 2624.96V2631.2L1454.9 2658.21V2597.95Z" fill={`url(#${id}_p11)`} />
          <path d="M1340.59 2735.52L2359.02 2762.53V2768.77L1340.59 2795.78V2735.52Z" fill={`url(#${id}_p12)`} />
          <path d="M1267.84 2874.13L2265.49 2900.11V2906.34L1267.84 2932.32V2874.13Z" fill={`url(#${id}_p13)`} />
          <path d="M1236.67 3014.41L2140.78 3039.34V3045.58L1236.67 3070.52V3014.41Z" fill={`url(#${id}_p14)`} />
          <path d="M1236.67 3154.69L1974.51 3177.55V3183.78L1236.67 3206.64V3154.69Z" fill={`url(#${id}_p15)`} />
          <path d="M1278.24 3294.96L1745.88 3313.67V3319.9L1322.61 3338.71L1278.24 3294.96Z" fill={`url(#${id}_p16)`} />
        </g>
      </g>
    </svg>
  );
};

export const FlameLinkLogo: React.FC<FlameLinkLogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
  variant = 'default',
}) => {
  const iconSize =
    size === 'sm' ? 'w-5 h-6' : size === 'lg' ? 'w-8 h-9' : size === 'xl' ? 'w-10 h-12' : 'w-6 h-7';
  const textSize =
    size === 'sm'
      ? 'text-[15px]'
      : size === 'lg'
      ? 'text-[22px]'
      : size === 'xl'
      ? 'text-[26px]'
      : 'text-[18px]';

  const textFlameColor = variant === 'on-dark' ? 'text-white' : 'text-[#262626]';
  const textLinkColor =
    variant === 'on-dark'
      ? 'text-[#FF0055]'
      : variant === 'monochrome'
      ? 'text-[#262626]'
      : 'text-[#FF0055]';

  return (
    <span className={`group inline-flex items-center gap-2.5 select-none transition-transform duration-200 cursor-pointer ${className}`}>
      {/* Exact Vector SVG Mark with Flame Hover Animation */}
      <span className="flex items-center justify-center shrink-0">
        <FlameMark className={iconSize} />
      </span>

      {/* Baseline-Unified Wordmark strictly using Changa font */}
      {showWordmark && (
        <span
          className={`${textSize} font-extrabold tracking-tight leading-none inline-flex items-baseline font-changa`}
          style={{ letterSpacing: '-0.02em' }}
        >
          <span className={textFlameColor}>Flame</span>
          <span className={textLinkColor}>Link</span>
        </span>
      )}
    </span>
  );
};
