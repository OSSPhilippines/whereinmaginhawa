import {
  Beer, Coffee, UtensilsCrossed, Fish, Soup, ChefHat,
  PawPrint, Wifi, Wallet, Moon, Pizza, Sandwich, Sunrise,
  Flame, IceCreamCone, Heart, Users, Camera, Leaf, TreePine,
  PartyPopper, Drumstick, Search, CircleCheck, Store,
  type LucideProps,
} from 'lucide-react';
import type { FC } from 'react';

const iconMap: Record<string, FC<LucideProps>> = {
  beer: Beer,
  coffee: Coffee,
  utensils: UtensilsCrossed,
  fish: Fish,
  soup: Soup,
  'chef-hat': ChefHat,
  'paw-print': PawPrint,
  wifi: Wifi,
  wallet: Wallet,
  moon: Moon,
  pizza: Pizza,
  sandwich: Sandwich,
  sunrise: Sunrise,
  flame: Flame,
  'ice-cream': IceCreamCone,
  heart: Heart,
  users: Users,
  camera: Camera,
  leaf: Leaf,
  tree: TreePine,
  'party-popper': PartyPopper,
  drumstick: Drumstick,
  search: Search,
  'circle-check': CircleCheck,
  store: Store,
};

interface CategoryIconProps extends LucideProps {
  name: string;
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const Icon = iconMap[name] || UtensilsCrossed;
  return <Icon {...props} />;
}
