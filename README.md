# 📚 사전 과제

백엔드 경력 채용 면접에 앞서 `사전 과제`가 있습니다. 회원가입 및 탈퇴, 로그인 및 로그아웃 등 웹 어플리케이션에서 필수적인 사용자와 관련된 기능을 자유롭게 구현해주시면 됩니다. 또한 만들어진 기능을 확인할 수 있는 테스트 코드도 빠질 수 없습니다. 나아가 서버 로그나 에러 처리 기능도 선택해서 작업해주신다면 더욱 좋습니다.

올려주신 프로젝트를 바탕으로, 인터뷰에서 구현해주신 내용에 대해 질문을 드릴 예정입니다. 면접에서 편하게 답변을 해주시면 됩니다. 😊

> **Note**:
_설명하시는 코드를 함께 볼 수 있도록 google meet에서 [화면 공유](https://support.google.com/meet/answer/9308856?hl=ko&co=GENIE.Platform%3DDesktop) 기능을 미리 숙지 부탁드립니다._

</br>

---

</br>

## 🔍 방법

- 해당 repository에 작업을 올려주시면 됩니다.
- 전체 프로젝트에 대한 설명과 그렇게 구현한 이유를 [Issues](https://docs.github.com/en/issues)에 간단히 설명 부탁드립니다.
- 기능들을 작은 단위로 나누어 개발 내용에 맞게 [PR](https://docs.github.com/en/pull-requests)을 만들고, 코멘트에서 개발한 내용을 요약 부탁드립니다.
- 과제는 메일로 안내드린 기간까지 마감 부탁드립니다. 그 전에 마무리되면 helium@ant-inc.co 로 연락 부탁드립니다.
- 로컬에서 앱을 실행할 수 있는 방법과 REST API endpoint들의 역할, URI, method, parameter, body 등을 [Issues](https://docs.github.com/en/issues)에 간단히 정리 부탁드립니다.
- 작업하신 DB에 해당 프로젝트가 연결되지 않아도 괜찮지만, 스키마 또는 모델을 확인할 수 있도록 작업 부탁드립니다.

</br>

---

</br>

## 📝 기능 구현

1. 회원가입 _(필수)_
   - ID: 이메일 / PW: 영어 대소문자+숫자 (각각 최소 1자 이상, 총 10자 이상)
   - 비밀번호 암호화
   - 이메일과 비밀번호 형식 체크
   - 이미 회원가입되어 있는 이메일 체크
2. 회원탈퇴 _(필수)_
   - 로그인한 상태에서 비밀번호를 받아서 확인 후 탈퇴 처리
   - 탈퇴 후 로그아웃
3. 로그인 _(필수)_
   - 마지막 서버 요청 (로그인, 유저 정보 업데이트) 후, 1시간 로그인 유지
   - 5번 비밀번호 틀린 경우 5분간 로그인 제한
4. 로그아웃 _(필수)_
5. 유저 정보 업데이트 _(필수)_
   - 로그인이 된 상태에서 현재 비밀번호 체크 후, 새로운 비밀번호로 변경
   - 현재 비밀번호와 동일한 것으로 변경 불가
   - 로그아웃이 된 상태에서는 변경 불가
6. 테스트
   - 통합 테스트 _(필수)_
     - 각 API 별 기능 테스트: 예상되는 `status` 코드와 응답 데이터 검증
   - 유닛 테스트 _(선택)_
     - 각 함수 별 단위 테스트: 해당 함수의 로직과 연관이 없는 기능은 mocking 필요 (ex. service의 기능은 DB 호출에 의존하면 안되므로 DB 호출에 대한 부분은 mock으로 만들기)
7. 서버 로그 _(선택)_
   - 모든 요청의 기본적인 정보 출력: `${METHOD} ${REQUEST_URL} ${RESPONSE_STATUS_CODE}`
   - 통합적으로 에러 로그 핸들링하기
8. 통합 에러 처리 _(선택)_
   - 클라이언트가 에러를 핸들링할 수 있도록 에러 응답 포맷
     - 적절한 `status` 코드 `description` 또는 `message` 지정하기
     - 통합적으로 에러 응답 핸들링하기

</br>

---

</br>

## 📬 응답

### Template

| Name    | Required | Type     |
| ------- | -------- | -------- |
| status  | yes      | `number` |
| message | no       | `string` |
| data    | no       | `object` |

### Examples

- 성공: `{ status: 200, data: {...} }`
- 실패: `{ status: 500, message: "Something went wrong." }`

</br>

---

</br>

## 🛠 기술 스택

### 필수

- [TypeScript](https://www.typescriptlang.org/)
- [npm](https://www.npmjs.com/) 또는 [Yarn](https://yarnpkg.com/)
- [Express](https://expressjs.com/) 또는 [NestJS](https://nestjs.com/)

### 선택

- SQL 또는 NoSQL
  - ORM / ODM 사용 가능
  - Entity의 스키마 또는 모델을 확인할 수 있도록 작성 (코드 또는 수기)
- [Jest](https://jestjs.io/) / [Mocha](https://mochajs.org/) / [Chai](https://www.chaijs.com/)
