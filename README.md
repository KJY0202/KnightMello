# KNIGHT MELLO — Unofficial Fan Site

React + Vite + React Router + Framer Motion으로 만든 비공식 팬메이드 사이트입니다.
공식 사이트처럼 정돈된 편집 디자인을 목표로 했으며, 실제 공식 사이트로 오해되지 않도록 비공식 안내를 표시했습니다.

## 실행하기

```bash
npm install
npm run dev
```

터미널에 표시되는 로컬 주소를 브라우저에서 열어주세요.

## 우선 수정할 곳

`src/data/siteData.js`에서 사진, 일정, 공지, 멤버 소개, 영상 링크를 관리합니다.

- `HOME_GROUP_IMAGE`: 홈 상단 단체 사진 경로. 예: `"/images/group-main.jpg"`
- `OFFICIAL_X_URL`: 나이트멜로 공식 X(트위터) 주소
- `SCHEDULES`: 캘린더 일정
- `NOTICES`: 공지 목록
- `MEMBERS`: 멤버명, 소개, 색상, 사진 경로
- `VIDEOS`: 영상 썸네일과 영상 URL
- `PHOTOS`: 사진 아카이브

사진 파일은 `public/images/` 폴더를 만들고 그 안에 넣으면 됩니다. 예를 들어 `public/images/group-main.jpg`는 코드에서 `/images/group-main.jpg`로 참조합니다.

## 페이지 경로

- `/` 홈
- `/notice` 공지
- `/schedule` 스케줄
- `/profile` 프로필
- `/video` 비디오
- `/photo` 포토

## 참고

- 일정/공지에 들어간 예시는 디자인 확인용 샘플입니다. 실제 정보로 교체해 주세요.
- 비공식 팬사이트이며, 공식 운영진과 제휴 또는 연관된 사이트가 아닙니다.


## Google Calendar 연동하기

이 프로젝트는 **공개 Google Calendar + Google Calendar API** 방식으로 월별 일정을 가져옵니다. 캘린더 UI는 사이트 디자인을 유지하고, 날짜를 바꾸면 해당 월의 일정이 API에서 다시 불러와집니다.

1. Google Calendar에서 별도 캘린더를 만들고, **설정 및 공유 → 액세스 권한**에서 공개 캘린더로 설정합니다. 공개할 일정만 넣은 전용 캘린더를 권장합니다.
2. Google Cloud Console에서 프로젝트를 만들고 **Google Calendar API**를 사용 설정합니다.
3. API 키를 만든 뒤 HTTP referrer(웹사이트) 제한을 설정하고, API 제한은 Google Calendar API로 제한합니다.
4. `package.json`이 있는 `knight/` 폴더에서 `.env.example`을 복사해 같은 폴더에 `.env`로 저장합니다.
5. 복사한 `.env`에서 아래 값을 실제 값으로 바꿉니다. `.env`는 커밋하지 마세요.

```env
VITE_GOOGLE_CALENDAR_ID=실제_캘린더_ID
VITE_GOOGLE_API_KEY=실제_API_키
```

6. 개발 서버를 재시작합니다 (`Ctrl + C` 후 `npm run dev`). 월 일정이 250개를 넘는 경우에도 모든 페이지를 이어서 가져옵니다.

**중요:** 공개 캘린더 API는 누구나 읽을 수 있는 일정만 노출하는 용도입니다. 비공개 캘린더를 API 키만으로 읽을 수는 없습니다. API 키는 브라우저에 노출되는 구조이므로 반드시 웹사이트 리퍼러와 API 사용 범위를 제한하세요. 공식 일정 공유가 목적이라면 개인 캘린더 대신 공개 전용 캘린더를 사용하세요.
