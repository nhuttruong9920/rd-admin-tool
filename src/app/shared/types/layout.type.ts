type NavStyle = 'default' | 'compact';

type NavItem = {
  label: string;
  command?: () => void;
  routerLink?: string;
  icon?: string;
  badge?: string | number;
  attention?: boolean;

  children?: NavItemChild[];
  expanded?: boolean;
};

type NavItemChild = Pick<
  NavItem,
  'label' | 'icon' | 'routerLink' | 'command' | 'badge' | 'attention'
>;

type RelativeWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

enum WidthBreakpoint {
  Sm = 640,
  Md = 768,
  Lg = 1024,
  Xl = 1280,
  Xxl = 1536,
}

export type { NavStyle, RelativeWidth, NavItem, NavItemChild };

export { WidthBreakpoint };
