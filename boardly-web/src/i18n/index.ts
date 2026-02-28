import { computed, ref } from 'vue'

export type Locale = 'en' | 'fr' | 'ar'

type MessageKey =
  | 'app.name'
  | 'common.logout'
  | 'common.language'
  | 'common.openSidebar'
  | 'common.openUserMenu'
  | 'common.loading'
  | 'common.error'
  | 'section.core'
  | 'section.agile'
  | 'section.admin'
  | 'nav.dashboard'
  | 'nav.boards'
  | 'nav.tasks'
  | 'nav.sprints'
  | 'nav.backlog'
  | 'nav.team'
  | 'nav.billing-subscription'
  | 'nav.settings'
  | 'backlog.title'
  | 'backlog.description'
  | 'boards.title'
  | 'boards.description'
  | 'sprints.title'
  | 'sprints.description'
  | 'tasks.title'
  | 'tasks.description'
  | 'menu.dashboard'
  | 'menu.settings'
  | 'menu.earnings'
  | 'menu.signOut'
  | 'auth.signIn'
  | 'auth.createAccount'
  | 'auth.email'
  | 'auth.password'
  | 'auth.companyName'
  | 'auth.rememberMe'
  | 'auth.forgotPassword'
  | 'auth.noAccount'
  | 'auth.haveAccount'
  | 'auth.signUp'
  | 'dashboard.welcome'
  | 'dashboard.activeSprints'
  | 'dashboard.tasksInProgress'
  | 'dashboard.completionRate'
  | 'dashboard.recentActivity'
  | 'dashboard.quickActions'
  | 'dashboard.createTask'
  | 'dashboard.inviteMember'
  | 'dashboard.newSprint'
  | 'dashboard.activity.created'
  | 'dashboard.activity.completed'
  | 'dashboard.activity.commented'
  | 'dashboard.activity.joined'
  | 'dashboard.tasksByStatus'
  | 'dashboard.workload'

type MessageTable = Record<MessageKey, string>

const messages: Record<Locale, MessageTable> = {
  en: {
    'app.name': 'Boardly DevOps',
    'common.logout': 'Logout',
    'common.language': 'Language',
    'common.openSidebar': 'Open sidebar',
    'common.openUserMenu': 'Open user menu',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'section.core': 'Core',
    'section.agile': 'Agile',
    'section.admin': 'Administration',
    'nav.dashboard': 'Dashboard',
    'nav.boards': 'Boards',
    'nav.tasks': 'My Tasks',
    'nav.sprints': 'Sprints',
    'nav.backlog': 'Backlog',
    'nav.team': 'Team Members',
    'nav.billing-subscription': 'Billing & Subscription',
    'nav.settings': 'Company Settings',
    'backlog.title': 'Product Backlog',
    'backlog.description': 'Manage and prioritize your team tasks and product features.',
    'boards.title': 'Kanban Board',
    'boards.description': 'Visualize your workflow and track task progress across development stages.',
    'sprints.title': 'Active Sprints',
    'sprints.description': 'Plan and track your current development cycles.',
    'tasks.title': 'My Tasks',
    'tasks.description': 'Focus on the work assigned to you and track your progress.',
    'menu.dashboard': 'Dashboard',
    'menu.settings': 'Settings',
    'menu.earnings': 'Earnings',
    'menu.signOut': 'Sign out',
    'auth.signIn': 'Sign In',
    'auth.createAccount': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.companyName': 'Company Name',
    'auth.rememberMe': 'Remember me',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.signUp': 'Sign up',
    'dashboard.welcome': 'Welcome to your SaaS platform',
    'dashboard.activeSprints': 'Active Sprints',
    'dashboard.tasksInProgress': 'Tasks in Progress',
    'dashboard.completionRate': 'Completion Rate',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.createTask': 'Create Task',
    'dashboard.inviteMember': 'Invite Member',
    'dashboard.newSprint': 'New Sprint',
    'dashboard.activity.created': 'created a new task',
    'dashboard.activity.completed': 'completed a task',
    'dashboard.activity.commented': 'commented on',
    'dashboard.activity.joined': 'joined the team',
    'dashboard.tasksByStatus': 'Tasks by Status',
    'dashboard.workload': 'Workload Distribution',
  },
  fr: {
    'app.name': 'Boardly DevOps',
    'common.logout': 'Se deconnecter',
    'common.language': 'Langue',
    'common.openSidebar': 'Ouvrir la barre laterale',
    'common.openUserMenu': "Ouvrir le menu d'utilisateur",
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'section.core': 'Noyau',
    'section.agile': 'Agile',
    'section.admin': 'Administration',
    'nav.dashboard': 'Tableau de bord',
    'nav.boards': 'Tableaux',
    'nav.tasks': 'Mes taches',
    'nav.sprints': 'Sprints',
    'nav.backlog': 'Backlog',
    'nav.team': "Membres de l'equipe",
    'nav.billing-subscription': 'Facturation et abonnement',
    'nav.settings': "Parametres de l'entreprise",
    'backlog.title': 'Backlog de produit',
    'backlog.description': "Gerez et priorisez les taches de votre equipe et les fonctionnalites du produit.",
    'boards.title': 'Tableau Kanban',
    'boards.description': 'Visualisez votre flux de travail et suivez la progression des taches.',
    'sprints.title': 'Sprints Actifs',
    'sprints.description': 'Planifiez et suivez vos cycles de developpement actuels.',
    'tasks.title': 'Mes Taches',
    'tasks.description': 'Concentrez-vous sur le travail qui vous est assigne et suivez vos progres.',
    'menu.dashboard': 'Tableau de bord',
    'menu.settings': 'Parametres',
    'menu.earnings': 'Revenus',
    'menu.signOut': 'Se deconnecter',
    'auth.signIn': 'Se connecter',
    'auth.createAccount': 'Creer un compte',
    'auth.email': 'E-mail',
    'auth.password': 'Mot de passe',
    'auth.companyName': "Nom de l'entreprise",
    'auth.rememberMe': 'Se souvenir de moi',
    'auth.forgotPassword': 'Mot de passe oublie ?',
    'auth.noAccount': "Vous n'avez pas de compte ?",
    'auth.haveAccount': 'Vous avez deja un compte ?',
    'auth.signUp': "S'inscrire",
    'dashboard.welcome': 'Bienvenue sur votre plateforme SaaS',
    'dashboard.activeSprints': 'Sprints Actifs',
    'dashboard.tasksInProgress': 'Tâches en Cours',
    'dashboard.completionRate': 'Taux d\'Achèvement',
    'dashboard.recentActivity': 'Activité Récente',
    'dashboard.quickActions': 'Actions Rapides',
    'dashboard.createTask': 'Créer une Tâche',
    'dashboard.inviteMember': 'Inviter un Membre',
    'dashboard.newSprint': 'Nouveau Sprint',
    'dashboard.activity.created': 'a créé une nouvelle tâche',
    'dashboard.activity.completed': 'a terminé une tâche',
    'dashboard.activity.commented': 'a commenté sur',
    'dashboard.activity.joined': 'a rejoint l\'équipe',
    'dashboard.tasksByStatus': 'Tâches par Statut',
    'dashboard.workload': 'Répartition de la Charge de Travail',
  },
  ar: {
    'app.name': 'Boardly DevOps',
    'common.logout': 'تسجيل الخروج',
    'common.language': 'اللغة',
    'common.openSidebar': 'فتح الشريط الجانبي',
    'common.openUserMenu': 'فتح قائمة المستخدم',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'section.core': 'الاساسي',
    'section.agile': 'أجايل',
    'section.admin': 'الإدارة',
    'nav.dashboard': 'لوحة التحكم',
    'nav.boards': 'اللوحات',
    'nav.tasks': 'مهامي',
    'nav.sprints': 'السبرنت',
    'nav.backlog': 'الباك لوج',
    'nav.team': 'فريق العمل',
    'nav.billing-subscription': 'الفوترة والاشتراك',
    'nav.settings': 'إعدادات الشركة',
    'backlog.title': 'قائمة المهام المؤجلة',
    'backlog.description': 'إدارة وترتيب أولويات مهام الفريق وميزات المنتج.',
    'boards.title': 'لوحة كانبان',
    'boards.description': 'تصور سير العمل وتتبع تقدم المهام عبر مراحل التطوير.',
    'sprints.title': 'السبرنت النشط',
    'sprints.description': 'تخطيط وتتبع دورات التطوير الحالية الخاصة بك.',
    'tasks.title': 'مهامي',
    'tasks.description': 'ركز على العمل الموكل إليك وتتبع تقدمك.',
    'menu.dashboard': 'لوحة التحكم',
    'menu.settings': 'الإعدادات',
    'menu.earnings': 'الأرباح',
    'menu.signOut': 'تسجيل الخروج',
    'auth.signIn': 'تسجيل الدخول',
    'auth.createAccount': 'إنشاء حساب',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.companyName': 'اسم الشركة',
    'auth.rememberMe': 'تذكرني',
    'auth.forgotPassword': 'هل نسيت كلمة المرور؟',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.haveAccount': 'لديك حساب بالفعل؟',
    'auth.signUp': 'إنشاء حساب',
    'dashboard.welcome': 'مرحبًا بك في منصة SaaS الخاصة بك',
    'dashboard.activeSprints': 'السبرنت النشطة',
    'dashboard.tasksInProgress': 'المهام قيد التقدم',
    'dashboard.completionRate': 'معدل الإنجاز',
    'dashboard.recentActivity': 'النشاط الأخير',
    'dashboard.quickActions': 'إجراءات سريعة',
    'dashboard.createTask': 'إنشاء مهمة',
    'dashboard.inviteMember': 'دعوة عضو',
    'dashboard.newSprint': 'سبرنت جديد',
    'dashboard.activity.created': 'أنشأ مهمة جديدة',
    'dashboard.activity.completed': 'أكمل مهمة',
    'dashboard.activity.commented': 'علق على',
    'dashboard.activity.joined': 'انضم إلى الفريق',
    'dashboard.tasksByStatus': 'المهام حسب الحالة',
    'dashboard.workload': 'توزيع عبء العمل',
  },
}

const locale = ref<Locale>('en')

function applyLocale(nextLocale: Locale) {
  locale.value = nextLocale
  if (typeof document !== 'undefined') {
    document.documentElement.lang = nextLocale
    document.documentElement.dir = nextLocale === 'ar' ? 'rtl' : 'ltr'
  }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('locale', nextLocale)
  }
}

export function initI18n() {
  if (typeof window === 'undefined') return
  const saved = window.localStorage.getItem('locale') as Locale | null
  if (saved && saved in messages) {
    applyLocale(saved)
    return
  }
  applyLocale('en')
}

export function useI18n() {
  const locales: Locale[] = ['en', 'fr', 'ar']
  const t = (key: MessageKey): string => messages[locale.value][key] ?? messages.en[key]
  const currentLocale = computed(() => locale.value)

  return {
    locale: currentLocale,
    locales,
    t,
    setLocale: applyLocale,
  }
}
