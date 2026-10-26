// 실제 정보에 맞춰 이 파일만 수정하면 홈/각 페이지의 콘텐츠를 쉽게 관리할 수 있어요.
export const NAV_ITEMS = [
  { label: "홈", path: "/" },
  { label: "공지", path: "/notice" },
  { label: "스케줄", path: "/schedule" },
  { label: "프로필", path: "/profile" },
  { label: "VIDEO", path: "/video" },
  { label: "PHOTO", path: "/photo" },
];

// 공식 X(트위터) 주소를 넣어주세요.
export const OFFICIAL_X_URL = "https://x.com/Kmello_OFCL";

// Google Calendar 연동 설정은 프로젝트 루트의 .env 파일에서 관리합니다.
// API 설정 전 화면 확인용 일정이며, 연동 설정이 완료되면 Google Calendar 일정이 표시됩니다.
export const SCHEDULES = [
  {
    date: "2026-10-24",
    time: "17:30",
    title: "SAMPLE EVENT",
    detail: "Google Calendar 연결 전 샘플 일정",
    place: "siteData.js에서 수정 가능",
  },
];

export const NOTICES = [
  {
    id: 1,
    category: "NOTICE",
    date: "2026.10.22",
    title: "나이트멜로 비공식 팬사이트 안내",
    body: "이 사이트는 팬이 제작한 비공식 팬사이트입니다. 공식 소식은 공식 SNS를 통해 확인해 주세요.",
  },
  {
    id: 2,
    category: "LIVE",
    date: "2026.10.18",
    title: "라이브 일정 안내",
    body: "공연 일정과 상세 정보는 공식 안내를 확인해 주세요. 본 페이지의 일정은 편의를 위한 정리이며 변경될 수 있습니다.",
  },
  {
    id: 3,
    category: "UPDATE",
    date: "2026.10.12",
    title: "사이트 업데이트",
    body: "프로필과 사진, 영상 섹션은 콘텐츠가 준비되는 대로 업데이트할 예정입니다.",
  },
];

export const MEMBERS = [
  {
    id: "emo",
    name: "エモ",
    nameKo: "에모",
    color: "#c6b6f3",
    role: "MEMBER",
    bio: "紫",
    image: "/images/emo.jpeg",
  },
  {
    id: "pareo",
    name: "パレオ",
    nameKo: "파레오",
    color: "#f2d66d",
    role: "MEMBER",
    bio: "黄色",
    image: "/images/pareo.jpeg",
  },
  {
    id: "popa",
    name: "ぽぱ",
    nameKo: "포파",
    color: "#9bd9c5",
    role: "MEMBER",
    bio: "ミントグリーン",
    image: "/images/popa.jpeg",
  },
  {
    id: "saetbyeol",
    name: "セッビョル",
    nameKo: "샛별",
    color: "#d8d8d4",
    role: "MEMBER",
    bio: "白",
    image: "/images/setbyol.jpeg",
  },
];

// 이미지 파일을 public/images 폴더에 넣고 경로를 입력하세요.
// 예: image: "/images/group-main.jpg"
export const HOME_GROUP_IMAGE = "/images/group.jpeg";
export const VIDEOS = [
  {
    id: "v1",
    title: "LOVE SET GO! (Official Live Video)",
    category: "LIVE",
    date: "2026.10.12",
    thumbnail: "/images/thumb1.avif",
    url: "https://youtu.be/KmfQ8NvdG4c?si=c2yM5pUTgq1y7e63",
  },
  {
    id: "v2",
    title: "VIDEO TITLE 02",
    category: "MOVIE",
    date: "2026.10.14",
    thumbnail: "",
    url: "",
  },
  {
    id: "v3",
    title: "VIDEO TITLE 03",
    category: "LIVE",
    date: "2026.10.08",
    thumbnail: "",
    url: "",
  },
];
export const PHOTOS = [
  { id: "p1", title: "PHOTO ARCHIVE 01", date: "2026.10.20", image: "" },
  { id: "p2", title: "PHOTO ARCHIVE 02", date: "2026.10.14", image: "" },
  { id: "p3", title: "PHOTO ARCHIVE 03", date: "2026.10.08", image: "" },
  { id: "p4", title: "PHOTO ARCHIVE 04", date: "2026.10.02", image: "" },
  { id: "p5", title: "PHOTO ARCHIVE 05", date: "2026.09.28", image: "" },
  { id: "p6", title: "PHOTO ARCHIVE 06", date: "2026.09.20", image: "" },
];
