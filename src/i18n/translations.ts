export type Language = 'en' | 'ko' | 'ja' | 'zh';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & Views
    board: 'Kanban Board',
    backlog: 'Backlog & Sprints',
    roadmap: 'Timeline Roadmap',
    reports: 'Agile Reports',
    automation: 'Automation Engine',
    retrospective: 'Sprint Retrospective',
    settings: 'Project Settings',

    // Header & Actions
    searchPlaceholder: 'Search issues (Press Cmd+K)...',
    createIssue: 'Create Issue',
    aiCopilot: 'Aether AI Copilot',

    // Filters
    onlyMyIssues: 'Only My Issues',
    allEpics: 'All Epics',
    allTypes: 'All Types',
    allPriorities: 'All Priorities',
    clearFilters: 'Clear Filters',

    // Columns & Status
    todo: 'TO DO',
    in_progress: 'IN PROGRESS',
    in_review: 'IN REVIEW',
    done: 'DONE',

    // AI Copilot
    sprintHealthStandup: 'Sprint Health & Standup',
    autoBalancer: 'Auto-Balancer',
    specGenerator: 'Spec Generator',
    sprintHealthIndex: 'Sprint Health Index',
    dailyStandupDigest: 'Daily AI Standup & Digest',
    generateAISpecs: 'Generate AI Specifications',

    // Retrospective
    wentWell: 'What Went Well',
    toImprove: 'What Can Be Improved',
    actionItems: 'Action Items',
    addToColumn: 'Add item...',

    // Settings
    languageSetting: 'Language / 언어 / 言語 / 语言',
    selectLanguage: 'Select System Language',
    themeSetting: 'Theme Mode',
    darkTheme: 'Dark Theme',
    lightTheme: 'Light Theme',
    resetData: 'Reset Demo Data',
    exportData: 'Export Workspace JSON',
    importData: 'Import Workspace JSON',

    // Issue Modals
    summary: 'Summary',
    description: 'Description',
    assignee: 'Assignee',
    reporter: 'Reporter',
    storyPoints: 'Story Points',
    dueDate: 'Due Date',
    timeTracking: 'Time Tracking',
    comments: 'Comments',
    subtasks: 'Sub-tasks',
    addComment: 'Add a comment...',
    addSubtask: 'Add a subtask...',
    save: 'Save Issue',
    cancel: 'Cancel'
  },

  ko: {
    // Navigation & Views
    board: '칸반 보드',
    backlog: '백로그 & 스프린트',
    roadmap: '타임라인 로드맵',
    reports: '애자일 리포트',
    automation: '자동화 엔진',
    retrospective: '스프린트 회고',
    settings: '프로젝트 설정',

    // Header & Actions
    searchPlaceholder: '이슈 검색 (Cmd+K)...',
    createIssue: '이슈 생성',
    aiCopilot: 'Aether AI 코파일럿',

    // Filters
    onlyMyIssues: '내 이슈만 보기',
    allEpics: '모든 에픽',
    allTypes: '모든 유형',
    allPriorities: '모든 우선순위',
    clearFilters: '필터 초기화',

    // Columns & Status
    todo: '할 일 (TO DO)',
    in_progress: '진행 중 (IN PROGRESS)',
    in_review: '검토 중 (IN REVIEW)',
    done: '완료 (DONE)',

    // AI Copilot
    sprintHealthStandup: '스프린트 건강도 & 스탠드업',
    autoBalancer: '자동 업무 분담기',
    specGenerator: '스펙 자동 생성기',
    sprintHealthIndex: '스프린트 건강도 지수',
    dailyStandupDigest: '데일리 AI 스탠드업 요약',
    generateAISpecs: 'AI 스펙 & 서브태스크 생성',

    // Retrospective
    wentWell: '🟢 잘한 점 (Went Well)',
    toImprove: '🟠 개선할 점 (To Improve)',
    actionItems: '🔵 실행 과제 (Action Items)',
    addToColumn: '의견 추가...',

    // Settings
    languageSetting: '시스템 언어 설정 (Language)',
    selectLanguage: '언어를 선택하세요',
    themeSetting: '화면 테마 모드',
    darkTheme: '다크 테마 (Dark)',
    lightTheme: '라이트 테마 (Light)',
    resetData: '데모 데이터 초기화',
    exportData: '워크스페이스 JSON 내보내기',
    importData: '워크스페이스 JSON 가져오기',

    // Issue Modals
    summary: '요약 제목',
    description: '상세 설명',
    assignee: '담당자',
    reporter: '보고자',
    storyPoints: '스토리 포인트',
    dueDate: '마감일',
    timeTracking: '시간 추적',
    comments: '댓글 목록',
    subtasks: '서브태스크',
    addComment: '댓글 작성...',
    addSubtask: '하위 작업 추가...',
    save: '이슈 저장',
    cancel: '취소'
  },

  ja: {
    // Navigation & Views
    board: 'カンバンボード',
    backlog: 'バックログとスプリント',
    roadmap: 'タイムラインロードマップ',
    reports: 'アジャイルレポート',
    automation: '自動化エンジン',
    retrospective: 'スプリント振り返り',
    settings: 'プロジェクト設定',

    // Header & Actions
    searchPlaceholder: '課題を検索 (Cmd+K)...',
    createIssue: '課題を作成',
    aiCopilot: 'Aether AIコパイロット',

    // Filters
    onlyMyIssues: '自分の課題のみ',
    allEpics: 'すべてのエピック',
    allTypes: 'すべてのタイプ',
    allPriorities: 'すべての優先度',
    clearFilters: 'フィルターをクリア',

    // Columns & Status
    todo: '作業前 (TO DO)',
    in_progress: '進行中 (IN PROGRESS)',
    in_review: 'レビュー中 (IN REVIEW)',
    done: '完了 (DONE)',

    // AI Copilot
    sprintHealthStandup: 'スプリント健康度＆スタンドアップ',
    autoBalancer: '自動負荷バランサー',
    specGenerator: '仕様生成エンジン',
    sprintHealthIndex: 'スプリント健康度インデックス',
    dailyStandupDigest: 'デイリーAIスタンドアップ要約',
    generateAISpecs: 'AI仕様＆サブタスク生成',

    // Retrospective
    wentWell: '🟢 良かった点 (Went Well)',
    toImprove: '🟠 改善すべき点 (To Improve)',
    actionItems: '🔵 アクションアイテム (Action Items)',
    addToColumn: 'アイテムを追加...',

    // Settings
    languageSetting: '言語設定 (Language)',
    selectLanguage: 'システム言語を選択',
    themeSetting: 'テーマモード',
    darkTheme: 'ダークテーマ (Dark)',
    lightTheme: 'ライトテーマ (Light)',
    resetData: 'デモデータをリセット',
    exportData: 'ワークスペースJSONのエクスポート',
    importData: 'ワークスペースJSONのインポート',

    // Issue Modals
    summary: '要約',
    description: '説明',
    assignee: '担当者',
    reporter: '報告者',
    storyPoints: 'ストーリーポイント',
    dueDate: '期限',
    timeTracking: '時間トラッキング',
    comments: 'コメント',
    subtasks: 'サブタスク',
    addComment: 'コメントを入力...',
    addSubtask: 'サブタスクを追加...',
    save: '課題を保存',
    cancel: 'キャンセル'
  },

  zh: {
    // Navigation & Views
    board: '看板视图',
    backlog: '待办事项与冲刺',
    roadmap: '时间线路线图',
    reports: '敏捷分析报告',
    automation: '自动化引擎',
    retrospective: '迭代回顾会',
    settings: '项目设置',

    // Header & Actions
    searchPlaceholder: '搜索事项 (Cmd+K)...',
    createIssue: '新建事项',
    aiCopilot: 'Aether AI 助手',

    // Filters
    onlyMyIssues: '仅看我的事项',
    allEpics: '所有史诗',
    allTypes: '所有类型',
    allPriorities: '所有优先级',
    clearFilters: '重置筛选',

    // Columns & Status
    todo: '待办 (TO DO)',
    in_progress: '进行中 (IN PROGRESS)',
    in_review: '审核中 (IN REVIEW)',
    done: '已完成 (DONE)',

    // AI Copilot
    sprintHealthStandup: '冲刺健康度与站会',
    autoBalancer: '智能工作量均衡',
    specGenerator: '需求规格生成器',
    sprintHealthIndex: '冲刺健康指数',
    dailyStandupDigest: '每日 AI 站会摘要',
    generateAISpecs: '生成 AI 规格与子任务',

    // Retrospective
    wentWell: '🟢 做得好的地方 (Went Well)',
    toImprove: '🟠 需要改进的地方 (To Improve)',
    actionItems: '🔵 行动项 (Action Items)',
    addToColumn: '添加记录...',

    // Settings
    languageSetting: '系统语言设置 (Language)',
    selectLanguage: '选择界面语言',
    themeSetting: '主题模式',
    darkTheme: '深色模式 (Dark)',
    lightTheme: '浅色模式 (Light)',
    resetData: '重置演示数据',
    exportData: '导出工作区 JSON',
    importData: '导入工作区 JSON',

    // Issue Modals
    summary: '主题',
    description: '详细描述',
    assignee: '经办人',
    reporter: '报告人',
    storyPoints: '故事点',
    dueDate: '到期日',
    timeTracking: '时间跟踪',
    comments: '评论列表',
    subtasks: '子任务',
    addComment: '添加评论...',
    addSubtask: '添加子任务...',
    save: '保存事项',
    cancel: '取消'
  }
};
