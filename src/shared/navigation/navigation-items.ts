import {
  Home,
  LogIn,
  PlusCircle,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

type NavigationItem = {
  href: string;
  labelKey: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  requiresAuth?: boolean;
  guestOnly?: boolean;
  adminOnly?: boolean;
};

export const navigationItems: NavigationItem[] = [
  {
    href: '/',
    labelKey: 'Home',
    icon: Home,
  },
  {
    href: '/create',
    labelKey: 'Create',
    icon: PlusCircle,
    requiresAuth: true,
  },
  {
    href: '/profile',
    labelKey: 'Profile',
    icon: User,
    requiresAuth: true,
  },
  {
    href: '/admin',
    labelKey: 'Admin',
    icon: ShieldCheck,
    requiresAuth: true,
    adminOnly: true,
  },
  {
    href: '/login',
    labelKey: 'Login',
    icon: LogIn,
    guestOnly: true,
  },
  {
    href: '/register',
    labelKey: 'Register',
    icon: UserPlus,
    guestOnly: true,
  },
];
