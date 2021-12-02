## 프리온보딩 백엔드 과정 2번째 과제: 프레시코드

[redbricks](https://wizlab.net/)에서 제공해주신 API 설계 과제입니다. 헤로쿠를 이용해 배포했으며, 주소는 [https://pocky-redbrick-subject.herokuapp.com](https://pocky-redbrick-subject.herokuapp.com)입니다.

## 과제에 대한 안내

학생들에게 코딩의 재미를 느낄 수 있게 간단한 게임을 코딩을 통해 만들 수 있는 플랫폼을 개발합니다.

1. 필수 요구 사항

- 회원가입
- 게임 제작
  - 프로젝트는 실시간으로 반영이 되어야 합니다
    - 프로젝트 수정 중 의도치 않은 사이트 종료 시에도 작업 내역은 보존되어야 합니다
- 게임 출시하기
  - **프로젝트 당 퍼블리싱 할 수 있는 개수는 하나**입니다.
  - 퍼블리싱한 게임은 수정할 수 있어야 하며, 수정 후 재출시시 기존에 퍼블리싱된 게임도 수정됩니다
  - 출시하는 게임은 다른 사용자들도 볼 수 있으며, 사용자들의 **조회수 / 좋아요 등을 기록**할 수 있어야 합니다
  - '게임 혹은 사용자 **검색**'을 통해서 찾을 수 있어야 합니다

2. 개발 요구사항

- '회원가입'부터 '게임 출시'까지 필요한 테이블을 설계하세요
- 다음에 필요한 API를 설계하세요
  - 게임 제작 API
  - 조회수 수정, 좋아요 API
  - 게임/사용자 검색 API
- 사용자는 상품 조회만 가능합니다.
- 선택사항
  - 프로젝트 실시간 반영을 위한 Architecture 를 설계하세요 ( 그림이 있다면 좋습니다 )
  - 위의 Architecture 를 토대로 기능을 구현하세요

## 데이터베이스 ERD

![데이터베이스 ERD](https://user-images.githubusercontent.com/47234375/140962281-fd05897c-4839-4036-aac6-f3948ae01519.png)

## 개발 환경

- 언어: TypeScript
- 데이터베이스: SQLite3
- 사용 도구: NestJs, typeorm, passport, passport-local, passport-jwt, bcrypt, class-validator, cache-manager, @nestjs/schedule

## API 문서

포스트맨으로 작성한 [API 문서](https://documenter.getpostman.com/view/15323948/UVC5F7xT)에서 상세한 내용을 확인하실 수 있습니다.

## 실행 방법

1. `git clone` 으로 프로젝트를 가져온 후, `npm install` 으로 필요한 패키지를 설치합니다.
2. 루트 디렉토리에 .env 파일을 생성하고, 임의의 문자열 값을 가진 `JWT_SECRET`을 작성합니다.
3. 개발 환경일 때는`npm run start:dev`으로, 배포 환경일 때는 `npm run build`으로 빌드한 후 `npm run start:prod`을 입력하시면 로컬에서 테스트하실 수 있습니다.
4. POST `localhost:3000/users`에서 `email`, `password`, `nickname`를 입력해 유저를 생성합니다.
5. POST `localhost:3000/auth/signin`에 `email`, `password`을 입력하신 후 결과값으로 accessToken을 발급받습니다.
6. 프로젝트 생성, 퍼블리싱 등 권한이 필요한 API의 주소를 입력한 후, Headers 의 Authorization에 accessToken을 붙여넣어 권한을 얻은 후 API를 호출합니다.

## Architecture

![redbrick-architecture](https://user-images.githubusercontent.com/42320464/140992108-5c6a77ae-df8e-42f3-957b-8e6078953353.jpg)

1. 클라이언트는 프로젝트 조회 요청 후 현재 데이터 Local Storage 에 저장합니다.
2. 클라이언트 프로젝트 수정 시 Local Storage 값과 비교하여 다르면 서버에게 프로젝트 업데이트를 요청합니다.
3. 서버는 cache 에 데이터를 임시로 저장한 후, 그 값을 응답으로 전달합니다.
4. 클라이언트 요청이 특정 시간 이상 없을 시, 가장 최근에 저장한 값을 가져와 데이터베이스에 반영합니다.

## 수행한 작업

### 프로젝트 조회, 생성, 삭제

프로젝트(게임 퍼블리싱 전 단계의, 현재 제작중인 게임) 의 조회, 생성, 삭제 기능을 구현했습니다. 기능을 수행하기 위해서는 로그인이 필요하며, 로그인한 유저가 프로젝트의 작성자인지 아닌지 확인하는 과정을 거칩니다.

1. 프로젝트 생성

문자열 값 title 를 필수로, code 를 선택사항으로 입력해 프로젝트를 생성합니다.

2. 목록 및 상세 조회

목록 조회는 로그인한 유저의 프로젝트 목록을 보여주며, pagination 으로 한 번에 5개씩 출력합니다. 상세 조회는 프로젝트의 id 를 파라미터로 받아 특정 프로젝트를 출력합니다.

### 게임 검색

join, pagination, 검색 쿼리를 실행하기 위해 [typeorm](https://typeorm.io/) 의 `createQueryBuilder`을 사용했습니다. 총 개수와 검색 결과를 응답으로 전달합니다. 프로젝트 목록 조회와 동일하게 한 번에 5개씩 출력합니다.

```typescript
// game.service.ts
async function search(
  limit: number,
  offset: number,
  keyword: string
): Promise<{ totalCount: number; data: Game[] }> {
  const totalCount = await this.gameRepository
    .createQueryBuilder('game')
    .innerJoin('game.user', 'user')
    .where(`game.title like :keyword`, { keyword: `%${keyword}%` })
    .orWhere(`user.nickname like :keyword`, { keyword: `%${keyword}%` })
    .getCount();
  const data = await this.gameRepository
    .createQueryBuilder('game')
    .innerJoin('game.user', 'user')
    .where(`game.title like :keyword`, { keyword: `%${keyword}%` })
    .orWhere(`user.nickname like :keyword`, { keyword: `%${keyword}%` })
    .limit(limit)
    .offset(offset)
    .getMany();
  return { totalCount, data };
}
```

`andWhere`, `orWhere` 메소드로 게임의 제목 또는 유저의 닉네임이 키워드와 일치하는 부분이 있는지를 확인합니다.

### 게임 퍼블리싱

유저가 작성한 프로젝트를 게임으로 출시하는 기능입니다. 프로젝트 조회, 게임 생성, 게임 수정 등 여러 기능을 복합적으로 사용하기 떄문에 중간에 에러가 발생하면 그동안 수행했던 과정을 취소하는 [TypeORM 트랜잭션](https://docs.nestjs.kr/techniques/database#transactions)을 사용했습니다.

```typescript
// project.controller.ts
async function publishProject(
  @Param('id') id: string,
  @Body() publishProjectDto: PublishProjectDto,
  @GetUser() user: User
): Promise<IPublishResponseMessage> {
  const queryRunner = this.connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const project = await this.projectsService.findOne(+id);

    // user가 project 작성자인지 확인
    if (project.user.id !== user.id) {
      throw new UnauthorizedException('프로젝트의 작성자가 아닙니다');
    }

    if (!project.isPublished) {
      // 게임이 없는 경우 게임 생성
      const createGameDto = {
        title: project.title,
        ...publishProjectDto,
        code: project.code,
        projectId: project.id,
      };
      await this.gameService.createGame(createGameDto, project, user);
    } else {
      // 게임이 존재하는 경우 게임 수정
      const game = await this.gameService.getGameByProjectId(project);
      let updateGameDto;
      updateGameDto = Object.assign(
        {},
        { title: project.title, code: project.code, ...publishProjectDto }
      );
      if (game.deletedAt) {
        // 게임이 삭제된 적이 있는 경우
        await this.gameService.restoreGame(game.id);
        updateGameDto = { ...updateGameDto, createdAt: new Date() };
      }
      await this.gameService.updateGame(game.id, updateGameDto, user);
    }
    await this.projectsService.update(project.id, { isPublished: true }, user);
    await queryRunner.commitTransaction();
    return { message: 'publish complete' };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    return { message: 'publish fail' };
  } finally {
    await queryRunner.release();
  }
}
```

### 프로젝트 유닛 테스트

[서비스 유닛 테스트](https://github.com/chinsanchung/preonboarding-redbrick/blob/main/src/projects/projects.service.spec.ts)와 [컨트롤러 유닛 테스트](https://github.com/chinsanchung/preonboarding-redbrick/blob/main/src/projects/projects.controller.spec.ts)를 작성해서 코드가 의도대로 작동하는지를 테스트했습니다.

## 폴더 구조

```
|   .eslintrc.js
|   .gitignore
|   .prettierrc
|   nest-cli.json
|   package-lock.json
|   package.json
|   Procfile
|   README.md
|   tree.txt
|   tsconfig.build.json
|   tsconfig.json
|
+---.github
|       PULL_REQUEST_TEMPLATE.md
|
+---src
|   |   app.controller.spec.ts
|   |   app.controller.ts
|   |   app.module.ts
|   |   app.service.ts
|   |   main.ts
|   |
|   +---auth
|   |   |   auth.controller.ts
|   |   |   auth.module.ts
|   |   |   auth.service.spec.ts
|   |   |   auth.service.ts
|   |   |   get-user.decorator.ts
|   |   |   jwt-auth.guard.ts
|   |   |   jwt.strategy.ts
|   |   |
|   |   \---dto
|   |           login-user.dto.ts
|   |
|   +---cache
|   |       cache.module.ts
|   |       cache.service.ts
|   |
|   +---core
|   |   \---entities
|   |           core.entity.ts
|   |
|   +---game
|   |   |   game.controller.ts
|   |   |   game.module.ts
|   |   |   game.repository.ts
|   |   |   game.service.spec.ts
|   |   |   game.service.ts
|   |   |
|   |   +---dto
|   |   |       create-game.dto.ts
|   |   |       update-game.dto.ts
|   |   |
|   |   \---entities
|   |           game.entity.ts
|   |
|   +---projects
|   |   |   projects.controller.spec.ts
|   |   |   projects.controller.ts
|   |   |   projects.interface.ts
|   |   |   projects.module.ts
|   |   |   projects.service.spec.ts
|   |   |   projects.service.ts
|   |   |
|   |   +---dto
|   |   |       create-project.dto.ts
|   |   |       publish-project.dto.ts
|   |   |       update-project.dto.ts
|   |   |
|   |   \---entities
|   |           project.entity.ts
|   |
|   \---users
|       |   user.service.spec.ts
|       |   users.controller.spec.ts
|       |   users.controller.ts
|       |   users.module.ts
|       |   users.service.ts
|       |
|       +---dto
|       |       create-user.dto.ts
|       |       update-user.dto.ts
|       |
|       \---entities
|               user.entity.ts
|
\---test
        app.e2e-spec.ts
        jest-e2e.json
```
