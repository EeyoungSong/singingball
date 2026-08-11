# iOS 싱잉볼 고양이 앱 구현 계획

## 1. 추천 스택

초기 목표가 iPhone 앱이고 추후 위젯까지 만들 계획이라면 네이티브 iOS 스택을 추천한다.

- 앱 UI: SwiftUI
- 캐릭터 애니메이션: SwiftUI Image 시퀀스 또는 SpriteKit
- 사운드 재생: AVFoundation
- 로컬 기록 저장: SwiftData
- 간단한 설정 저장: AppStorage 또는 UserDefaults
- 위젯: WidgetKit
- 위젯 액션: App Intents
- 앱/위젯 데이터 공유: App Groups

## 2. 스택 선택 이유

SwiftUI는 작은 감성 앱을 빠르게 만들기 좋고, WidgetKit과 App Intents를 같은 코드베이스에서 자연스럽게 붙일 수 있다. 싱잉볼 앱은 복잡한 3D나 물리 엔진보다 이미지 프레임 애니메이션, 사운드, 로컬 저장이 핵심이므로 네이티브 iOS 구성이 가장 단순하다.

React Native나 Flutter도 가능하지만, iOS 위젯과 App Intents까지 깔끔하게 연결하려면 결국 네이티브 코드를 많이 만지게 된다. 처음부터 iPhone 중심으로 갈 거라면 SwiftUI가 낫다.

## 3. 애니메이션 구현 방식

### 3.1 MVP 방식: 프레임 이미지 시퀀스

현재 에셋처럼 `hit_01.png`, `hit_02.png` 형태의 프레임을 준비하고, 터치 이벤트가 발생하면 순서대로 이미지를 교체한다.

추천:

- 치는 애니메이션: 8 frames, 400ms
- 돌리는 애니메이션: 12 frames, 600ms
- 프레임 간격: 50ms

이 방식은 구현이 단순하고, 고양이의 귀여운 손그림 느낌을 정확히 살리기 좋다.

### 3.2 추후 방식: SpriteKit

애니메이션이 많아지고 파동 효과, 입자 효과, 여러 캐릭터 상태가 들어가면 SpriteKit을 쓰는 편이 좋다.

초기에는 SwiftUI `Image` 시퀀스로 시작하고, 다음 조건이 생기면 SpriteKit 전환을 검토한다.

- 동시에 여러 애니메이션을 재생해야 함
- 싱잉볼 파동, 반짝임, 입자 효과가 늘어남
- 터치 위치에 따라 반응이 달라짐
- 캐릭터 상태 머신이 복잡해짐

## 4. 에셋 제작 규격

픽셀 튐 없이 자연스럽게 움직이려면 모든 프레임이 같은 캔버스 크기와 같은 기준점을 가져야 한다.

### 4.1 프레임 PNG 규칙

- 파일 형식: PNG
- 배경: 투명
- 캔버스 크기: 모든 프레임 동일
- 고양이와 싱잉볼 위치: 모든 프레임에서 같은 기준점 유지
- 그림자가 있다면 그림자도 모든 프레임에 포함
- 파일명은 2자리 숫자 고정

예시:

```text
Assets/Animation/CatHit/hit_01.png
Assets/Animation/CatHit/hit_02.png
Assets/Animation/CatHit/hit_03.png
Assets/Animation/CatHit/hit_04.png
Assets/Animation/CatHit/hit_05.png
Assets/Animation/CatHit/hit_06.png
Assets/Animation/CatHit/hit_07.png
Assets/Animation/CatHit/hit_08.png

Assets/Animation/CatRoll/roll_01.png
Assets/Animation/CatRoll/roll_02.png
...
Assets/Animation/CatRoll/roll_12.png
```

### 4.2 권장 캔버스

현재 이미지 비율을 기준으로 보면 앱에서 쓰기 좋은 프레임 캔버스는 다음 중 하나다.

- 768 x 768: 가장 단순한 정사각형 캐릭터 에셋
- 1024 x 1024: 고해상도 대응에 유리
- 900 x 700: 고양이와 싱잉볼 형태에 맞춘 넓은 캔버스

초기에는 `1024 x 1024` 정사각형 투명 PNG를 추천한다. SwiftUI에서 크기를 줄여 쓰면 되고, 모든 프레임 정렬도 쉽다.

### 4.3 기준점

프레임별로 아래 기준점을 고정한다.

- 싱잉볼 바닥 중심
- 고양이 몸통 중심
- 전체 그림자 바닥선

막대만 움직이고 고양이 몸통은 거의 고정되게 만들면 훨씬 안정적으로 보인다.

## 5. 현재 이미지 에셋 처리 방향

첨부된 이미지는 실제 프레임 원본이라기보다 프레임 목록과 GIF 미리보기가 함께 들어간 시트다. 이 이미지를 그대로 앱 에셋으로 쓰기에는 다음 문제가 있다.

- 배경이 투명하지 않음
- 프레임 아래 파일명이 같이 들어가 있음
- 오른쪽 GIF 미리보기 영역이 섞여 있음
- 각 프레임 주변 여백이 완전히 동일하지 않을 수 있음
- 누끼를 자동으로 따면 흰 고양이와 밝은 배경 경계가 일부 손상될 수 있음

따라서 최종 앱에는 이 시트가 아니라 개별 투명 PNG 원본을 넣는 것을 추천한다.

가능한 워크플로:

1. 디자인 툴에서 `hit_01.png`부터 `hit_08.png`까지 개별 투명 PNG로 export
2. 모든 프레임을 같은 캔버스 크기로 export
3. `roll_01.png`부터 `roll_12.png`까지 동일하게 export
4. Xcode Asset Catalog에 프레임 이미지 추가
5. 앱에서 프레임 배열로 로드

## 6. 앱 내 애니메이션 표현

터치 시 흐름:

1. 사용자가 싱잉볼을 터치한다.
2. 현재 재생 중인 사운드가 있으면 겹치지 않게 정책을 결정한다.
3. `hit` 프레임 애니메이션을 400ms 재생한다.
4. 선택된 싱잉볼 사운드를 재생한다.
5. 싱잉볼 주변에 파동 효과를 1초 정도 표시한다.
6. `RingRecord`를 저장한다.

돌리는 애니메이션은 별도 버튼이나 길게 누르기로 연결할 수 있다.

- 짧게 탭: 치기
- 길게 누르기: 돌리기

## 7. 사운드 정책

싱잉볼은 소리가 긴 편이므로 터치할 때마다 무조건 새 사운드를 겹치게 하면 지저분해질 수 있다.

초기 추천 정책:

- 같은 싱잉볼을 연속 터치하면 기존 사운드를 부드럽게 줄이고 새로 재생
- 다른 싱잉볼로 바꾸면 기존 사운드를 중단하고 새 사운드 재생
- 볼륨 슬라이더는 2차 버전에서 추가

## 8. 위젯 설계

WidgetKit 위젯은 앱 화면처럼 자유로운 실시간 애니메이션이나 사운드 재생을 기대하면 안 된다. Apple 문서 기준으로 위젯은 Timeline으로 화면을 갱신하고, 버튼/토글 같은 상호작용은 App Intents로 처리한다.

초기 위젯 추천:

- 오늘 싱잉볼 울린 횟수 표시
- 마지막으로 울린 시간 표시
- 선택한 고양이/싱잉볼 정지 이미지 표시
- 버튼을 누르면 앱을 특정 화면으로 열기

추후 iOS 위젯/Control 확장:

- Control Center 버튼으로 앱 액션 실행
- App Intent로 기록만 추가
- 앱을 열어서 실제 사운드와 애니메이션 재생

위젯에서 직접 싱잉볼 소리를 재생하는 경험은 iOS 제약 때문에 핵심 기능으로 잡지 않는 편이 안전하다. 위젯은 "기록 확인"과 "빠른 진입" 중심으로 설계하고, 실제 소리와 고양이 애니메이션은 앱 안에서 제공하는 방향이 좋다.

## 9. 데이터 모델 초안

### 9.1 SwiftData 모델

```swift
@Model
final class RingRecord {
    var createdAt: Date
    var bowlId: String
    var backgroundId: String
    var animationType: String

    init(
        createdAt: Date = .now,
        bowlId: String,
        backgroundId: String,
        animationType: String
    ) {
        self.createdAt = createdAt
        self.bowlId = bowlId
        self.backgroundId = backgroundId
        self.animationType = animationType
    }
}
```

### 9.2 설정 저장

```swift
@AppStorage("selectedBowlId") var selectedBowlId = "default"
@AppStorage("selectedBackgroundId") var selectedBackgroundId = "cozy-room"
```

위젯과 공유해야 하는 값은 App Groups의 shared UserDefaults를 사용한다.

## 10. 개발 순서

1. Xcode에서 iOS App 프로젝트 생성
2. SwiftUI 홈 화면 구성
3. 고양이 프레임 이미지 로더 구현
4. 탭 시 `hit` 애니메이션 재생
5. AVFoundation으로 싱잉볼 사운드 재생
6. 싱잉볼 3종 선택 UI 추가
7. 배경 2종 선택 UI 추가
8. SwiftData로 울린 기록 저장
9. 기록 화면 구현
10. Widget Extension 추가
11. App Groups로 앱/위젯 데이터 공유
12. 위젯에 오늘 횟수와 최근 기록 표시

## 11. 결론

현재 앱은 `SwiftUI + AVFoundation + SwiftData`로 시작하는 것이 가장 적합하다. 애니메이션은 먼저 프레임 PNG 시퀀스로 구현하고, 위젯은 `WidgetKit + App Intents + App Groups`로 붙인다.

핵심은 에셋을 처음부터 같은 캔버스 크기의 투명 PNG 프레임으로 관리하는 것이다. 그래야 고양이가 흔들리거나 튀지 않고 실제로 움직이는 것처럼 보인다.
