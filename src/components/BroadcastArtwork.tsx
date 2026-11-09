import React from 'react';
import { EmojiId, MiniGameCategory } from '../types/game';

export const EmojiBadgeArtwork: React.FC<{ emojiId: EmojiId; className?: string }> = ({
  emojiId,
  className = 'w-24 h-24',
}) => {
  const isAngry = emojiId === 'angry';
  const gradId = `sphere-${emojiId}`;
  const rimId = `rim-${emojiId}`;

  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={gradId} cx="38%" cy="30%" r="68%">
          {isAngry ? (
            <>
              <stop offset="0%" stopColor="#FF7A45" />
              <stop offset="45%" stopColor="#EF4444" />
              <stop offset="82%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#991B1B" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="38%" stopColor="#FACC15" />
              <stop offset="78%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </>
          )}
        </radialGradient>
        <linearGradient id={rimId} x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1930" />
          <stop offset="100%" stopColor="#030914" />
        </linearGradient>
      </defs>

      {/* Outer Broadcast Frame */}
      <rect x="4" y="4" width="112" height="112" rx="22" fill={`url(#${rimId})`} stroke="#CBD5E1" strokeWidth="4" />
      {/* 3D Sphere Shadow */}
      <circle cx="60" cy="63" r="44" fill="#000000" fillOpacity="0.45" />
      {/* Main Glossy Sphere */}
      <circle cx="60" cy="60" r="43" fill={`url(#${gradId})`} stroke="#091526" strokeWidth="3.5" />
      {/* Top Specular Highlight */}
      <path
        d="M32 35C40 24 56 20 71 23C56 25 41 33 33 47C30 43 30 38 32 35Z"
        fill="white"
        fillOpacity="0.65"
      />
      <ellipse cx="34" cy="36" rx="8" ry="4" transform="rotate(-32 34 36)" fill="white" fillOpacity="0.8" />

      {emojiId === 'cry' && (
        <>
          {/* Sad Brows */}
          <path d="M31 44C37 42 44 39 49 34" stroke="#0B192C" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M89 44C83 42 76 39 71 34" stroke="#0B192C" strokeWidth="4.5" strokeLinecap="round" />
          {/* Glossy Eyes */}
          <ellipse cx="43" cy="55" rx="9.5" ry="11.5" fill="#061224" stroke="#000" strokeWidth="2" />
          <ellipse cx="77" cy="55" rx="9.5" ry="11.5" fill="#061224" stroke="#000" strokeWidth="2" />
          <circle cx="40" cy="51" r="3.5" fill="white" />
          <circle cx="74" cy="51" r="3.5" fill="white" />
          <circle cx="46" cy="59" r="1.8" fill="#38BDF8" />
          <circle cx="80" cy="59" r="1.8" fill="#38BDF8" />
          {/* Sad Frown */}
          <path d="M44 82C51 73 69 73 76 82" stroke="#061224" strokeWidth="5" strokeLinecap="round" />
          {/* Large 3D Blue Tear */}
          <path
            d="M87 62C87 62 97 77 95 86C93.5 92.5 87.5 95 82.5 93C77.5 91 76.5 84.5 79 77L87 62Z"
            fill="#0EA5E9"
            stroke="#061224"
            strokeWidth="2.8"
          />
          <ellipse cx="85" cy="84" rx="2.5" ry="5" fill="#E0F2FE" />
        </>
      )}

      {emojiId === 'crying_smili' && (
        <>
          {/* Happy Arched Brows */}
          <path d="M33 38C38 33 46 33 50 38" stroke="#061224" strokeWidth="4" strokeLinecap="round" />
          <path d="M70 38C74 33 82 33 87 38" stroke="#061224" strokeWidth="4" strokeLinecap="round" />
          {/* Laughing Closed Eyes */}
          <path d="M33 51C39 44 48 44 53 51" stroke="#061224" strokeWidth="5" strokeLinecap="round" />
          <path d="M67 51C72 44 81 44 87 51" stroke="#061224" strokeWidth="5" strokeLinecap="round" />
          {/* Wide Laughing Mouth */}
          <path
            d="M35 62H85C84 80 73 90 60 90C47 90 36 80 35 62Z"
            fill="#450A0A"
            stroke="#061224"
            strokeWidth="3.5"
          />
          <path d="M38 63H82V70H38V63Z" fill="white" />
          <ellipse cx="60" cy="83" rx="14" ry="6.5" fill="#EF4444" />
          {/* Dual Joy Tears */}
          <path
            d="M31 53C31 53 18 65 20 74C21.5 80 27 81 31 77C34 73 34 64 31 53Z"
            fill="#38BDF8"
            stroke="#061224"
            strokeWidth="2.5"
          />
          <path
            d="M89 53C89 53 102 65 100 74C98.5 80 93 81 89 77C86 73 86 64 89 53Z"
            fill="#38BDF8"
            stroke="#061224"
            strokeWidth="2.5"
          />
        </>
      )}

      {emojiId === 'love' && (
        <>
          {/* Left Heart Eye */}
          <path
            d="M42 60C42 60 26 50 28 39C29.5 32 37 31 42 37C47 31 54.5 32 56 39C58 50 42 60 42 60Z"
            fill="#EF4444"
            stroke="#061224"
            strokeWidth="3"
          />
          <circle cx="35" cy="39" r="2.8" fill="white" fillOpacity="0.85" />
          {/* Right Heart Eye */}
          <path
            d="M78 60C78 60 62 50 64 39C65.5 32 73 31 78 37C83 31 90.5 32 92 39C94 50 78 60 78 60Z"
            fill="#EF4444"
            stroke="#061224"
            strokeWidth="3"
          />
          <circle cx="71" cy="39" r="2.8" fill="white" fillOpacity="0.85" />
          {/* Open Happy Mouth */}
          <path
            d="M37 66H83C81 82 71 90 60 90C49 90 39 82 37 66Z"
            fill="#450A0A"
            stroke="#061224"
            strokeWidth="3.5"
          />
          <path d="M40 67H80V73H40V67Z" fill="white" />
          <ellipse cx="60" cy="83" rx="13" ry="6" fill="#F43F5E" />
        </>
      )}

      {emojiId === 'shock' && (
        <>
          {/* High Surprised Brows */}
          <path d="M32 34C37 28 46 28 51 33" stroke="#061224" strokeWidth="4" strokeLinecap="round" />
          <path d="M69 33C74 28 83 28 88 34" stroke="#061224" strokeWidth="4" strokeLinecap="round" />
          {/* Big White Eyes */}
          <ellipse cx="43" cy="51" rx="11" ry="13" fill="white" stroke="#061224" strokeWidth="3" />
          <ellipse cx="77" cy="51" rx="11" ry="13" fill="white" stroke="#061224" strokeWidth="3" />
          <circle cx="43" cy="52" r="6.5" fill="#061224" />
          <circle cx="77" cy="52" r="6.5" fill="#061224" />
          <circle cx="41" cy="49" r="2.5" fill="white" />
          <circle cx="75" cy="49" r="2.5" fill="white" />
          {/* Shocked Oval Mouth */}
          <ellipse cx="60" cy="79" rx="11" ry="13" fill="#450A0A" stroke="#061224" strokeWidth="3.5" />
          <ellipse cx="60" cy="85" rx="7.5" ry="5" fill="#EF4444" />
        </>
      )}

      {emojiId === 'silly' && (
        <>
          {/* Winking Left Eye */}
          <path d="M31 41C37 35 46 35 51 41" stroke="#061224" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M32 52C38 45 46 45 52 52" stroke="#061224" strokeWidth="5" strokeLinecap="round" />
          {/* Big Open Right Eye */}
          <path d="M68 34C74 30 82 31 87 36" stroke="#061224" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="76" cy="50" rx="10.5" ry="12.5" fill="white" stroke="#061224" strokeWidth="3" />
          <circle cx="75" cy="51" r="6.5" fill="#061224" />
          <circle cx="73" cy="48" r="2.5" fill="white" />
          {/* Mouth + Playful Tongue */}
          <path
            d="M36 65H84C82 79 72 86 60 86C48 86 38 79 36 65Z"
            fill="#450A0A"
            stroke="#061224"
            strokeWidth="3.5"
          />
          <path d="M39 66H81V72H39V66Z" fill="white" />
          <path
            d="M49 73H71V86C71 92 66 97 60 97C54 97 49 92 49 86V73Z"
            fill="#FB7185"
            stroke="#061224"
            strokeWidth="3"
          />
          <line x1="60" y1="74" x2="60" y2="91" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}

      {emojiId === 'smali' && (
        <>
          {/* Cheerful Brows */}
          <path d="M33 36C38 31 46 31 50 36" stroke="#061224" strokeWidth="4" strokeLinecap="round" />
          <path d="M70 36C74 31 82 31 87 36" stroke="#061224" strokeWidth="4" strokeLinecap="round" />
          {/* Bright Glossy Eyes */}
          <ellipse cx="43" cy="50" rx="8.5" ry="11" fill="#061224" />
          <ellipse cx="77" cy="50" rx="8.5" ry="11" fill="#061224" />
          <circle cx="40.5" cy="46" r="3.2" fill="white" />
          <circle cx="74.5" cy="46" r="3.2" fill="white" />
          {/* Big Classic Smile */}
          <path
            d="M35 65H85C83 82 73 91 60 91C47 91 37 82 35 65Z"
            fill="#450A0A"
            stroke="#061224"
            strokeWidth="3.5"
          />
          <path d="M38 66H82V73H38V66Z" fill="white" />
          <ellipse cx="60" cy="84" rx="14" ry="6" fill="#EF4444" />
        </>
      )}

      {emojiId === 'angry' && (
        <>
          {/* Fierce V-Brows */}
          <path d="M29 44L53 54" stroke="#061224" strokeWidth="6" strokeLinecap="round" />
          <path d="M91 44L67 54" stroke="#061224" strokeWidth="6" strokeLinecap="round" />
          {/* Intense Eyes */}
          <ellipse cx="43" cy="58" rx="8.5" ry="9.5" fill="#061224" />
          <ellipse cx="77" cy="58" rx="8.5" ry="9.5" fill="#061224" />
          <circle cx="40.5" cy="56" r="2.8" fill="white" />
          <circle cx="74.5" cy="56" r="2.8" fill="white" />
          {/* Deep Scowl */}
          <path d="M42 84C50 72 70 72 78 84" stroke="#061224" strokeWidth="5.5" strokeLinecap="round" />
        </>
      )}

      {emojiId === 'cool' && (
        <>
          {/* Raised Cool Brows */}
          <path d="M33 35C39 30 47 31 51 35" stroke="#061224" strokeWidth="4" strokeLinecap="round" />
          <path d="M69 35C73 31 81 30 87 35" stroke="#061224" strokeWidth="4" strokeLinecap="round" />
          {/* Aviator / Wayfarer Dark Sunglasses */}
          <path d="M18 46H102" stroke="#061224" strokeWidth="5" strokeLinecap="round" />
          <rect x="23" y="43" width="32" height="22" rx="6" fill="#09192F" stroke="#020617" strokeWidth="3.5" />
          <rect x="65" y="43" width="32" height="22" rx="6" fill="#09192F" stroke="#020617" strokeWidth="3.5" />
          {/* Lens Glare */}
          <path d="M28 47L38 47L31 60H26L28 47Z" fill="#38BDF8" fillOpacity="0.45" />
          <path d="M70 47L80 47L73 60H68L70 47Z" fill="#38BDF8" fillOpacity="0.45" />
          {/* Confident Smirk */}
          <path d="M42 77C51 84 69 84 78 75" stroke="#061224" strokeWidth="5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};

export const CategoryBadgeArtwork: React.FC<{
  category: MiniGameCategory;
  className?: string;
}> = ({ category, className = 'w-24 h-24' }) => {
  const bgId = `cat-bg-${category}`;
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="112" height="112" rx="22" fill={`url(#${bgId})`} stroke="#E2E8F0" strokeWidth="4" />

      {category === 'jersey' && (
        <g>
          <path
            d="M42 26L22 39L31 56L41 50V92H79V50L89 56L98 39L78 26H69C67 32 53 32 51 26H42Z"
            fill="#F8FAFC"
            stroke="#091526"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M48 26C51 34 69 34 72 26" stroke="#1E3A8A" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="26" y1="47" x2="35" y2="41" stroke="#1E3A8A" strokeWidth="3.5" />
          <line x1="94" y1="47" x2="85" y2="41" stroke="#1E3A8A" strokeWidth="3.5" />
          <text
            x="60"
            y="71"
            textAnchor="middle"
            fill="#0284C7"
            fontFamily="Outfit, sans-serif"
            fontWeight="900"
            fontSize="24"
          >
            10
          </text>
        </g>
      )}

      {category === 'photo' && (
        <g>
          <rect
            x="22"
            y="26"
            width="66"
            height="54"
            rx="8"
            transform="rotate(-6 22 26)"
            fill="#F8FAFC"
            stroke="#091526"
            strokeWidth="3.5"
          />
          <rect
            x="28"
            y="32"
            width="54"
            height="42"
            rx="4"
            transform="rotate(-6 28 32)"
            fill="#38BDF8"
          />
          <circle cx="67" cy="40" r="6" fill="#FEF08A" />
          <path d="M30 70L46 50L59 64L69 54L82 68H30Z" fill="#1E293B" />
          {/* 3D Question Mark */}
          <path
            d="M72 56C72 48 80 44 87 46C94 48 96 56 91 61C87 65 84 67 84 73"
            stroke="#F8FAFC"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <circle cx="84" cy="87" r="5.5" fill="#F8FAFC" stroke="#091526" strokeWidth="2.5" />
        </g>
      )}

      {category === 'stadium' && (
        <g>
          <ellipse cx="60" cy="48" rx="39" ry="18" fill="#E2E8F0" stroke="#091526" strokeWidth="3.5" />
          <ellipse cx="60" cy="50" rx="29" ry="11" fill="#0F172A" />
          <ellipse cx="60" cy="53" rx="23" ry="8" fill="#10B981" />
          <circle cx="60" cy="53" r="4" stroke="white" strokeWidth="1.5" />
          <path
            d="M21 48V74C21 85 38 92 60 92C82 92 99 85 99 74V48C99 59 82 66 60 66C38 66 21 59 21 48Z"
            fill="#F8FAFC"
            stroke="#091526"
            strokeWidth="3.5"
          />
          <rect x="30" y="68" width="12" height="10" rx="2" fill="#0F172A" />
          <rect x="46" y="71" width="12" height="10" rx="2" fill="#0F172A" />
          <rect x="62" y="71" width="12" height="10" rx="2" fill="#0F172A" />
          <rect x="78" y="68" width="12" height="10" rx="2" fill="#0F172A" />
        </g>
      )}

      {category === 'logo' && (
        <g>
          <path
            d="M60 18L92 30V58C92 79 77 94 60 101C43 94 28 79 28 58V30L60 18Z"
            fill="#F8FAFC"
            stroke="#091526"
            strokeWidth="4"
          />
          <path
            d="M60 25L85 34V57C85 74 73 87 60 93C47 87 35 74 35 57V34L60 25Z"
            fill="#E2E8F0"
            stroke="#94A3B8"
            strokeWidth="2"
          />
          <text
            x="60"
            y="60"
            textAnchor="middle"
            fill="#0F172A"
            fontFamily="Outfit, sans-serif"
            fontWeight="900"
            fontSize="20"
          >
            LOGO
          </text>
          <polygon points="60,72 62,77 68,77 63,80 65,86 60,82 55,86 57,80 52,77 58,77" fill="#0284C7" />
        </g>
      )}

      {category === 'tictactoe' && (
        <g>
          {/* Grid Bars */}
          <line x1="46" y1="22" x2="46" y2="98" stroke="#F8FAFC" strokeWidth="6" strokeLinecap="round" />
          <line x1="74" y1="22" x2="74" y2="98" stroke="#F8FAFC" strokeWidth="6" strokeLinecap="round" />
          <line x1="22" y1="46" x2="98" y2="46" stroke="#F8FAFC" strokeWidth="6" strokeLinecap="round" />
          <line x1="22" y1="74" x2="98" y2="74" stroke="#F8FAFC" strokeWidth="6" strokeLinecap="round" />
          {/* X and O pieces */}
          <path d="M26 26L38 38M38 26L26 38" stroke="#38BDF8" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M54 54L66 66M66 54L54 66" stroke="#38BDF8" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M82 82L94 94M94 82L82 94" stroke="#38BDF8" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="88" cy="32" r="7" stroke="#FACC15" strokeWidth="5" />
          <circle cx="32" cy="60" r="7" stroke="#FACC15" strokeWidth="5" />
          <circle cx="60" cy="88" r="7" stroke="#FACC15" strokeWidth="5" />
          {/* Diagonal Laser Line */}
          <line x1="24" y1="24" x2="96" y2="96" stroke="#E0F2FE" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {category === 'quiz' && (
        <g>
          <rect x="26" y="24" width="56" height="72" rx="8" fill="#F8FAFC" stroke="#091526" strokeWidth="3.5" />
          <rect x="42" y="17" width="24" height="12" rx="4" fill="#CBD5E1" stroke="#091526" strokeWidth="3" />
          <circle cx="39" cy="44" r="6" stroke="#091526" strokeWidth="2.5" />
          <path d="M36 44L39 47L45 39" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="51" y1="44" x2="72" y2="44" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
          <circle cx="39" cy="60" r="6" stroke="#091526" strokeWidth="2.5" />
          <line x1="51" y1="60" x2="70" y2="60" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
          <circle cx="39" cy="76" r="6" stroke="#091526" strokeWidth="2.5" />
          <line x1="51" y1="76" x2="66" y2="76" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
          {/* Question Mark */}
          <path
            d="M74 56C74 48 82 45 89 47C95 49 97 57 92 62C88 66 85 68 85 74"
            stroke="#F8FAFC"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="85" cy="87" r="5" fill="#F8FAFC" />
        </g>
      )}

      {category === 'number' && (
        <g>
          <text
            x="58"
            y="72"
            textAnchor="middle"
            fill="#F8FAFC"
            stroke="#091526"
            strokeWidth="3"
            fontFamily="Outfit, sans-serif"
            fontWeight="900"
            fontSize="44"
          >
            123?
          </text>
        </g>
      )}

      {category === 'audio' && (
        <g>
          <path
            d="M30 62V54C30 37.5 43.5 24 60 24C76.5 24 90 37.5 90 54V62"
            stroke="#F8FAFC"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <rect x="22" y="56" width="16" height="30" rx="8" fill="#F8FAFC" stroke="#091526" strokeWidth="3.5" />
          <rect x="82" y="56" width="16" height="30" rx="8" fill="#F8FAFC" stroke="#091526" strokeWidth="3.5" />
          <path d="M51 64C54 68 54 74 51 78" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M58 58C63 65 63 77 58 84" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M65 52C72 62 72 80 65 90" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

export const ClubCrestArtwork: React.FC<{ clubId: string; className?: string }> = ({
  clubId,
  className = 'w-12 h-12',
}) => {
  switch (clubId) {
    case 'real_madrid':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <circle cx="32" cy="36" r="22" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="4" />
          <path d="M22 14L27 8L32 13L37 8L42 14H22Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <path d="M16 26L48 46" stroke="#4F46E5" strokeWidth="5" />
          <text x="32" y="42" textAnchor="middle" fill="#B45309" fontWeight="900" fontSize="15" fontFamily="Outfit">
            RM
          </text>
        </svg>
      );
    case 'barcelona':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <path
            d="M14 14H50V34C50 47 32 56 32 56C32 56 14 47 14 34V14Z"
            fill="#1E3A8A"
            stroke="#F59E0B"
            strokeWidth="3.5"
          />
          <rect x="17" y="17" width="14" height="14" fill="#FFFFFF" />
          <line x1="24" y1="17" x2="24" y2="31" stroke="#DC2626" strokeWidth="4" />
          <line x1="17" y1="24" x2="31" y2="24" stroke="#DC2626" strokeWidth="4" />
          <rect x="33" y="17" width="14" height="14" fill="#FACC15" />
          <line x1="37" y1="17" x2="37" y2="31" stroke="#DC2626" strokeWidth="2.5" />
          <line x1="43" y1="17" x2="43" y2="31" stroke="#DC2626" strokeWidth="2.5" />
          <path d="M22 35V49M32 35V53M42 35V49" stroke="#DC2626" strokeWidth="5" />
        </svg>
      );
    case 'man_city':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <circle cx="32" cy="32" r="25" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="3.5" />
          <circle cx="32" cy="32" r="17" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
          <path d="M23 28H41L38 34H26L23 28Z" fill="#F59E0B" />
          <circle cx="32" cy="41" r="4" fill="#EF4444" />
        </svg>
      );
    case 'psg':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <circle cx="32" cy="32" r="25" fill="#1E3A8A" stroke="#FFFFFF" strokeWidth="3.5" />
          <circle cx="32" cy="32" r="18" stroke="#EF4444" strokeWidth="2.5" />
          <path d="M32 16L22 46H27L32 32L37 46H42L32 16Z" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="32" cy="42" r="3" fill="#FACC15" />
        </svg>
      );
    case 'chelsea':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <circle cx="32" cy="32" r="25" fill="#1D4ED8" stroke="#F59E0B" strokeWidth="3.5" />
          <circle cx="32" cy="32" r="17" fill="#FFFFFF" />
          <path d="M27 41V25L36 22L33 32L39 39H27Z" fill="#1D4ED8" />
          <circle cx="15" cy="32" r="2.5" fill="#EF4444" />
          <circle cx="49" cy="32" r="2.5" fill="#EF4444" />
        </svg>
      );
    case 'man_united':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <path
            d="M14 14H50V35C50 47 32 56 32 56C32 56 14 47 14 35V14Z"
            fill="#DC2626"
            stroke="#FACC15"
            strokeWidth="3.5"
          />
          <rect x="18" y="18" width="28" height="10" rx="2" fill="#FACC15" />
          <path d="M22 23H42" stroke="#991B1B" strokeWidth="2.5" />
          <circle cx="32" cy="39" r="8" fill="#FACC15" />
          <path d="M29 36L32 32L35 36L32 45L29 36Z" fill="#DC2626" />
        </svg>
      );
    case 'juventus':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <ellipse cx="32" cy="32" rx="20" ry="26" fill="#090D16" stroke="#FACC15" strokeWidth="3.5" />
          <path d="M22 10V54M30 8V56M38 10V54" stroke="#FFFFFF" strokeWidth="4.5" />
          <rect x="20" y="25" width="24" height="12" rx="3" fill="#090D16" stroke="#FACC15" strokeWidth="1.5" />
          <text x="32" y="34" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="10" fontFamily="Outfit">
            JUV
          </text>
        </svg>
      );
    case 'bayern':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <circle cx="32" cy="32" r="25" fill="#DC2626" stroke="#FFFFFF" strokeWidth="3.5" />
          <circle cx="32" cy="32" r="16" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="2.5" />
          <polygon points="32,18 44,32 32,46 20,32" fill="#FFFFFF" />
          <polygon points="32,22 40,32 32,42 24,32" fill="#38BDF8" />
        </svg>
      );
    case 'inter_milan':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <circle cx="32" cy="32" r="25" fill="#1E3A8A" stroke="#F59E0B" strokeWidth="3.5" />
          <circle cx="32" cy="32" r="18" fill="#090D16" stroke="#38BDF8" strokeWidth="2.5" />
          <path d="M22 18V46M29 15V49M36 15V49M43 18V46" stroke="#2563EB" strokeWidth="3.5" />
          <text x="32" y="37" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="14" fontFamily="Outfit">
            IM
          </text>
        </svg>
      );
    case 'ac_milan':
    default:
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <ellipse cx="32" cy="32" rx="20" ry="26" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="3.5" />
          <path d="M16 18V46M23 12V52M30 10V54" stroke="#DC2626" strokeWidth="4" />
          <path d="M19 14V50M26 11V53" stroke="#090D16" strokeWidth="3.5" />
          <line x1="42" y1="14" x2="42" y2="50" stroke="#DC2626" strokeWidth="5" />
          <line x1="33" y1="32" x2="50" y2="32" stroke="#DC2626" strokeWidth="5" />
        </svg>
      );
  }
};

export const NationFlagArtwork: React.FC<{ nationId: string; className?: string }> = ({
  nationId,
  className = 'w-12 h-12',
}) => {
  switch (nationId) {
    case 'brazil':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <rect x="6" y="14" width="52" height="36" rx="6" fill="#16A34A" stroke="#E2E8F0" strokeWidth="2.5" />
          <polygon points="32,19 52,32 32,45 12,32" fill="#FACC15" />
          <circle cx="32" cy="32" r="8" fill="#1E3A8A" />
          <path d="M25 31C29 29 35 30 39 33" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      );
    case 'argentina':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <rect x="6" y="14" width="52" height="36" rx="6" fill="#38BDF8" stroke="#E2E8F0" strokeWidth="2.5" />
          <rect x="7" y="26" width="50" height="12" fill="#FFFFFF" />
          <circle cx="32" cy="32" r="4.5" fill="#F59E0B" />
        </svg>
      );
    case 'france':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <rect x="6" y="14" width="52" height="36" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" />
          <path d="M7 20C7 17.2 9.2 15 12 15H24V49H12C9.2 49 7 46.8 7 44V20Z" fill="#1D4ED8" />
          <path d="M40 15H52C54.8 15 57 17.2 57 20V44C57 46.8 54.8 49 52 49H40V15Z" fill="#EF4444" />
        </svg>
      );
    case 'england':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <rect x="6" y="14" width="52" height="36" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" />
          <rect x="28" y="15" width="8" height="34" fill="#DC2626" />
          <rect x="7" y="28" width="50" height="8" fill="#DC2626" />
        </svg>
      );
    case 'spain':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <rect x="6" y="14" width="52" height="36" rx="6" fill="#DC2626" stroke="#E2E8F0" strokeWidth="2.5" />
          <rect x="7" y="23" width="50" height="18" fill="#FACC15" />
          <circle cx="21" cy="32" r="4.5" fill="#B91C1C" stroke="#F59E0B" strokeWidth="1.5" />
        </svg>
      );
    case 'portugal':
    default:
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none">
          <rect x="6" y="14" width="52" height="36" rx="6" fill="#DC2626" stroke="#E2E8F0" strokeWidth="2.5" />
          <path d="M7 20C7 17.2 9.2 15 12 15H27V49H12C9.2 49 7 46.8 7 44V20Z" fill="#15803D" />
          <circle cx="27" cy="32" r="6" fill="#FACC15" stroke="#B91C1C" strokeWidth="2" />
        </svg>
      );
  }
};
