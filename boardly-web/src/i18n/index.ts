import { computed, ref } from 'vue'

export type Locale = 'en' | 'fr' | 'ar'

type MessageKey =
  | 'app.name'
  | 'common.logout'
  | 'common.language'
  | 'common.openSidebar'
  | 'common.openUserMenu'
  | 'nav.dashboard'
  | 'nav.boards'
  | 'nav.tasks'
  | 'nav.team'
  | 'nav.settings'
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

type MessageTable = Record<MessageKey, string>

const messages: Record<Locale, MessageTable> = {
  en: {
    'app.name': 'Boardly DevOps',
    'common.logout': 'Logout',
    'common.language': 'Language',
    'common.openSidebar': 'Open sidebar',
    'common.openUserMenu': 'Open user menu',
    'nav.dashboard': 'Dashboard',
    'nav.boards': 'Boards',
    'nav.tasks': 'My Tasks',
    'nav.team': 'Team Members',
    'nav.settings': 'Company Settings',
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
  },
  fr: {
    'app.name': 'Boardly DevOps',
    'common.logout': 'Se deconnecter',
    'common.language': 'Langue',
    'common.openSidebar': 'Ouvrir la barre laterale',
    'common.openUserMenu': "Ouvrir le menu d'utilisateur",
    'nav.dashboard': 'Tableau de bord',
    'nav.boards': 'Tableaux',
    'nav.tasks': 'Mes taches',
    'nav.team': "Membres de l'equipe",
    'nav.settings': "Parametres de l'entreprise",
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
  },
  ar: {
    'app.name': 'Boardly DevOps',
    'common.logout': 'تسجيل الخروج',
    'common.language': 'اللغة',
    'common.openSidebar': 'فتح الشريط الجانبي',
    'common.openUserMenu': 'فتح قائمة المستخدم',
    'nav.dashboard': 'لوحة التحكم',
    'nav.boards': 'اللوحات',
    'nav.tasks': 'مهامي',
    'nav.team': 'فريق العمل',
    'nav.settings': 'إعدادات الشركة',
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
