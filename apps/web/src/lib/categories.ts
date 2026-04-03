import type { Category } from '@/types/category';

/**
 * SEO-optimized category pages configuration
 * Top 10 high-priority categories based on search intent and data analysis
 */
export const CATEGORIES: Category[] = [
  {
    slug: 'bars-in-maginhawa',
    icon: 'beer',
    title: 'Best Bars in Maginhawa Street - Nightlife & Drinks Guide',
    description:
      'Discover the top bars and nightlife spots in Maginhawa Street, Quezon City. From craft cocktails to local beers, find the perfect bar for your night out in Maginhawa.',
    heading: 'Best Bars in Maginhawa Street',
    content: `<p>Maginhawa Street is home to some of Quezon City's best bars and nightlife destinations. Whether you're looking for craft cocktails, live music, or a casual spot to grab drinks with friends, our curated list of bars in Maginhawa has you covered.</p>`,
    keywords: [
      'bars in maginhawa',
      'maginhawa bars',
      'nightlife maginhawa',
      'bars quezon city',
      'maginhawa street bars',
      'drinks maginhawa',
    ],
    filters: {
      keywords: ['bar', 'nightlife', 'drinks', 'cocktails', 'beer', 'wine'],
    },
    priority: 0.85,
    type: 'cuisine',
  },
  {
    slug: 'coffee-shops-in-maginhawa',
    icon: 'coffee',
    title: 'Best Coffee Shops in Maginhawa Street - Cafes & Work Spaces',
    description:
      'Find the best coffee shops and cafes in Maginhawa Street. Perfect for remote work, studying, or catching up with friends. WiFi, specialty coffee, and cozy ambiance await.',
    heading: 'Best Coffee Shops & Cafes in Maginhawa',
    content: `<p>Maginhawa Street is a haven for coffee lovers and remote workers. Discover cozy cafes with excellent WiFi, specialty coffee, and comfortable seating perfect for work or leisure.</p>`,
    keywords: [
      'coffee shops maginhawa',
      'cafes in maginhawa',
      'maginhawa coffee',
      'study spots maginhawa',
      'work cafes maginhawa',
      'specialty coffee maginhawa',
    ],
    filters: {
      keywords: ['cafe', 'coffee', 'coffee-shop', 'beverages', 'tea'],
    },
    priority: 0.9,
    type: 'cuisine',
  },
  {
    slug: 'filipino-restaurants-in-maginhawa',
    icon: 'utensils',
    title: 'Best Filipino Restaurants in Maginhawa - Authentic Local Cuisine',
    description:
      'Experience authentic Filipino cuisine in Maginhawa Street. From classic adobo to modern Filipino fusion, discover the best local restaurants serving traditional Filipino food.',
    heading: 'Best Filipino Restaurants in Maginhawa',
    content: `<p>Celebrate Filipino culinary heritage in Maginhawa Street. Our selection features restaurants serving authentic Filipino dishes, from timeless classics to contemporary interpretations of local favorites.</p>`,
    keywords: [
      'filipino restaurants maginhawa',
      'pinoy food maginhawa',
      'filipino cuisine maginhawa',
      'local food maginhawa',
      'authentic filipino maginhawa',
    ],
    filters: {
      keywords: ['filipino', 'pinoy', 'local', 'traditional', 'sisig', 'adobo'],
    },
    priority: 0.88,
    type: 'cuisine',
  },
  {
    slug: 'japanese-restaurants-in-maginhawa',
    icon: 'fish',
    title: 'Best Japanese Restaurants in Maginhawa - Ramen, Sushi & More',
    description:
      'Craving Japanese food? Explore the best Japanese restaurants in Maginhawa Street. From authentic ramen and sushi to katsu and donburi, satisfy your Japanese cuisine cravings.',
    heading: 'Best Japanese Restaurants in Maginhawa',
    content: `<p>Maginhawa Street offers a diverse selection of Japanese restaurants. Whether you're craving authentic ramen, fresh sushi, crispy katsu, or comforting donburi bowls, you'll find excellent Japanese dining options here.</p>`,
    keywords: [
      'japanese restaurants maginhawa',
      'ramen maginhawa',
      'sushi maginhawa',
      'japanese food maginhawa',
      'katsu maginhawa',
    ],
    filters: {
      keywords: ['japanese', 'ramen', 'sushi', 'katsu', 'donburi', 'tempura'],
    },
    priority: 0.87,
    type: 'cuisine',
  },
  {
    slug: 'korean-restaurants-in-maginhawa',
    icon: 'soup',
    title: 'Best Korean Restaurants in Maginhawa - Korean BBQ & K-Food',
    description:
      'Discover the best Korean restaurants in Maginhawa Street. Enjoy Korean BBQ, bibimbap, Korean fried chicken, and more authentic Korean dishes in the heart of Quezon City.',
    heading: 'Best Korean Restaurants in Maginhawa',
    content: `<p>Korean cuisine thrives in Maginhawa Street. From sizzling Korean BBQ to spicy kimchi stews and crispy Korean fried chicken, explore the vibrant flavors of Korea right here in Maginhawa.</p>`,
    keywords: [
      'korean restaurants maginhawa',
      'korean bbq maginhawa',
      'korean food maginhawa',
      'samgyupsal maginhawa',
      'korean fried chicken maginhawa',
    ],
    filters: {
      keywords: ['korean', 'samgyupsal', 'korean-fried-chicken', 'bibimbap', 'kimchi'],
    },
    priority: 0.86,
    type: 'cuisine',
  },
  {
    slug: 'italian-restaurants-in-maginhawa',
    icon: 'chef-hat',
    title: 'Best Italian Restaurants in Maginhawa - Pizza, Pasta & More',
    description:
      'Indulge in authentic Italian cuisine in Maginhawa Street. Find the best pizza, pasta, and Italian dishes prepared with traditional recipes and quality ingredients.',
    heading: 'Best Italian Restaurants in Maginhawa',
    content: `<p>Savor the flavors of Italy in Maginhawa Street. From wood-fired pizza and handmade pasta to classic Italian desserts, discover restaurants that bring authentic Italian cuisine to Quezon City.</p>`,
    keywords: [
      'italian restaurants maginhawa',
      'pizza maginhawa',
      'pasta maginhawa',
      'italian food maginhawa',
      'italian cuisine maginhawa',
    ],
    filters: {
      keywords: ['italian', 'pizza', 'pasta', 'italian-american'],
    },
    priority: 0.85,
    type: 'cuisine',
  },
  {
    slug: 'pet-friendly-restaurants-in-maginhawa',
    icon: 'paw-print',
    title: 'Pet-Friendly Restaurants in Maginhawa - Dine with Your Pets',
    description:
      'Looking for pet-friendly restaurants in Maginhawa? Discover cafes and restaurants where your furry friends are welcome. Enjoy quality food with your pets by your side.',
    heading: 'Pet-Friendly Restaurants in Maginhawa',
    content: `<p>Bring your furry companions along! Maginhawa Street has a growing number of pet-friendly establishments where you can enjoy great food while your pets relax by your side. Perfect for dog lovers and cat parents.</p>`,
    keywords: [
      'pet friendly restaurants maginhawa',
      'dog friendly cafes maginhawa',
      'pet friendly maginhawa',
      'restaurants with pets maginhawa',
      'dog friendly maginhawa',
    ],
    filters: {
      keywords: ['pet-friendly', 'pet friendly', 'dog-friendly', 'cat-friendly', 'pet-cafe'],
    },
    priority: 0.84,
    type: 'amenity',
  },
  {
    slug: 'wifi-cafes-in-maginhawa',
    icon: 'wifi',
    title: 'Best WiFi Cafes in Maginhawa - Work & Study Friendly Spots',
    description:
      'Find the best WiFi cafes in Maginhawa Street perfect for remote work, studying, or freelancing. Reliable internet, power outlets, and comfortable seating in great cafes.',
    heading: 'Best WiFi Cafes in Maginhawa',
    content: `<p>Need a productive workspace? Maginhawa Street is packed with WiFi-equipped cafes perfect for remote workers, students, and freelancers. Enjoy reliable internet, comfortable seating, and great coffee while you work.</p>`,
    keywords: [
      'wifi cafes maginhawa',
      'work cafes maginhawa',
      'study spots maginhawa',
      'coworking maginhawa',
      'remote work maginhawa',
      'freelancer cafes maginhawa',
    ],
    filters: {
      keywords: ['wifi', 'work-friendly', 'study-spot', 'student-friendly', 'power outlets', 'power-outlets'],
    },
    priority: 0.89,
    type: 'amenity',
  },
  {
    slug: 'budget-restaurants-in-maginhawa',
    icon: 'wallet',
    title: 'Budget-Friendly Restaurants in Maginhawa - Affordable Dining',
    description:
      'Discover affordable and budget-friendly restaurants in Maginhawa Street. Great food at wallet-friendly prices. Perfect for students and budget-conscious diners.',
    heading: 'Budget-Friendly Restaurants in Maginhawa',
    content: `<p>Enjoy delicious food without breaking the bank. Maginhawa Street offers numerous budget-friendly restaurants serving quality meals at affordable prices. Perfect for students, families, and anyone looking for great value.</p>`,
    keywords: [
      'budget restaurants maginhawa',
      'cheap eats maginhawa',
      'affordable restaurants maginhawa',
      'budget friendly maginhawa',
      'student meals maginhawa',
    ],
    filters: {
      keywords: ['budget-friendly', 'affordable', 'cheap', 'student-friendly'],
      priceRanges: ['$'],
    },
    priority: 0.86,
    type: 'price',
  },
  {
    slug: 'late-night-dining-in-maginhawa',
    icon: 'moon',
    title: 'Late Night Dining in Maginhawa - Open Late Restaurants & Cafes',
    description:
      'Craving food late at night? Discover restaurants and cafes in Maginhawa Street that stay open late. From midnight snacks to 24-hour dining, satisfy your late-night cravings.',
    heading: 'Late Night Dining in Maginhawa',
    content: `<p>Night owl? Maginhawa Street has you covered with late-night dining options. Whether you're studying late, working night shifts, or just craving midnight snacks, find restaurants that stay open late to serve you.</p>`,
    keywords: [
      'late night maginhawa',
      'open late maginhawa',
      '24 hours maginhawa',
      'midnight food maginhawa',
      'late night restaurants maginhawa',
    ],
    filters: {
      keywords: ['late-night', '24-hours', '24-hour', 'open-late', 'midnight'],
    },
    priority: 0.83,
    type: 'amenity',
  },
  {
    slug: 'pizza-in-maginhawa',
    icon: 'pizza',
    title: 'Best Pizza Places in Maginhawa - Wood-Fired & New York Style',
    description:
      'Craving pizza? Find the best pizza places in Maginhawa Street. From authentic wood-fired pizzas to New York-style slices, discover pizzerias serving delicious pies with quality toppings.',
    heading: 'Best Pizza Places in Maginhawa',
    content: `<p>Pizza lovers rejoice! Maginhawa Street offers a fantastic selection of pizzerias. Whether you prefer authentic Italian wood-fired pizza, generous New York-style slices, or creative specialty pies, you'll find the perfect pizza here.</p>`,
    keywords: [
      'pizza maginhawa',
      'pizza places maginhawa',
      'wood fired pizza maginhawa',
      'new york pizza maginhawa',
      'pizzeria maginhawa',
    ],
    filters: {
      keywords: ['pizza', 'wood-fired', 'pizzeria', 'italian', 'italian-american', 'new-york-style'],
    },
    priority: 0.85,
    type: 'cuisine',
  },
  {
    slug: 'chinese-restaurants-in-maginhawa',
    icon: 'utensils',
    title: 'Best Chinese Restaurants in Maginhawa - Dim Sum & Cantonese',
    description:
      'Explore the best Chinese restaurants in Maginhawa Street. From authentic dim sum and Cantonese cuisine to Chinese-Filipino favorites, enjoy traditional Chinese flavors and comfort food.',
    heading: 'Best Chinese Restaurants in Maginhawa',
    content: `<p>Discover authentic Chinese cuisine in Maginhawa Street. From steaming dim sum baskets to savory Cantonese dishes and Chinese-Filipino fusion favorites, experience the rich flavors of Chinese cooking.</p>`,
    keywords: [
      'chinese restaurants maginhawa',
      'dim sum maginhawa',
      'cantonese food maginhawa',
      'chinese food maginhawa',
      'chinese cuisine maginhawa',
    ],
    filters: {
      keywords: ['chinese', 'cantonese', 'dim-sum', 'chinese-filipino', 'dumplings', 'noodles'],
    },
    priority: 0.84,
    type: 'cuisine',
  },
  {
    slug: 'burger-joints-in-maginhawa',
    icon: 'sandwich',
    title: 'Best Burger Joints in Maginhawa - Gourmet & Classic Burgers',
    description:
      'Find the best burger joints in Maginhawa Street. From gourmet burgers to classic American-style patties, satisfy your burger cravings with juicy, flavorful options.',
    heading: 'Best Burger Joints in Maginhawa',
    content: `<p>Burger enthusiasts, rejoice! Maginhawa Street serves up some of the best burgers in Quezon City. From gourmet creations with artisan ingredients to classic American-style burgers, find your perfect patty here.</p>`,
    keywords: [
      'burgers maginhawa',
      'burger joints maginhawa',
      'best burgers maginhawa',
      'gourmet burgers maginhawa',
      'american burgers maginhawa',
    ],
    filters: {
      keywords: ['burgers', 'burger', 'american', 'grill', 'fries', 'patty'],
    },
    priority: 0.83,
    type: 'cuisine',
  },
  {
    slug: 'breakfast-brunch-in-maginhawa',
    icon: 'sunrise',
    title: 'Best Breakfast & Brunch in Maginhawa - All-Day Breakfast Spots',
    description:
      'Start your day right with the best breakfast and brunch spots in Maginhawa Street. From all-day breakfast to weekend brunch specials, find pancakes, eggs, and morning favorites.',
    heading: 'Best Breakfast & Brunch in Maginhawa',
    content: `<p>Morning person or brunch lover? Maginhawa Street has you covered with excellent breakfast and brunch options. Enjoy all-day breakfast, fluffy pancakes, hearty egg dishes, and specialty brunch menus perfect for lazy weekends.</p>`,
    keywords: [
      'breakfast maginhawa',
      'brunch maginhawa',
      'all day breakfast maginhawa',
      'pancakes maginhawa',
      'morning food maginhawa',
    ],
    filters: {
      keywords: ['breakfast', 'brunch', 'all-day-breakfast', 'pancakes', 'eggs', 'morning'],
    },
    priority: 0.86,
    type: 'cuisine',
  },
  {
    slug: 'vietnamese-restaurants-in-maginhawa',
    icon: 'soup',
    title: 'Best Vietnamese Restaurants in Maginhawa - Pho & Banh Mi',
    description:
      'Craving Vietnamese food? Discover the best Vietnamese restaurants in Maginhawa Street. From authentic pho noodle soups to delicious banh mi sandwiches, enjoy fresh Vietnamese flavors.',
    heading: 'Best Vietnamese Restaurants in Maginhawa',
    content: `<p>Experience the fresh and vibrant flavors of Vietnam in Maginhawa Street. From steaming bowls of pho to crispy banh mi sandwiches and spring rolls, discover authentic Vietnamese cuisine.</p>`,
    keywords: [
      'vietnamese restaurants maginhawa',
      'pho maginhawa',
      'banh mi maginhawa',
      'vietnamese food maginhawa',
      'vietnamese cuisine maginhawa',
    ],
    filters: {
      keywords: ['vietnamese', 'pho', 'banh-mi', 'spring-rolls', 'noodles'],
    },
    priority: 0.82,
    type: 'cuisine',
  },
  {
    slug: 'mexican-restaurants-in-maginhawa',
    icon: 'flame',
    title: 'Best Mexican Restaurants in Maginhawa - Tacos, Burritos & More',
    description:
      'Discover the best Mexican restaurants in Maginhawa Street. From authentic tacos and burritos to Tex-Mex favorites, enjoy bold Mexican flavors and fresh ingredients.',
    heading: 'Best Mexican Restaurants in Maginhawa',
    content: `<p>Spice up your dining experience with Mexican cuisine in Maginhawa Street. From authentic street tacos to loaded burritos and sizzling fajitas, discover restaurants bringing Mexican flavors to Quezon City.</p>`,
    keywords: [
      'mexican restaurants maginhawa',
      'tacos maginhawa',
      'burritos maginhawa',
      'mexican food maginhawa',
      'tex mex maginhawa',
    ],
    filters: {
      keywords: ['mexican', 'tacos', 'burritos', 'tex-mex', 'quesadillas', 'nachos', 'fajitas'],
    },
    priority: 0.82,
    type: 'cuisine',
  },
  {
    slug: 'thai-restaurants-in-maginhawa',
    icon: 'flame',
    title: 'Best Thai Restaurants in Maginhawa - Curry, Pad Thai & More',
    description:
      'Explore the best Thai restaurants in Maginhawa Street. From fragrant curries to savory pad thai and authentic Thai street food, enjoy the bold flavors of Thailand.',
    heading: 'Best Thai Restaurants in Maginhawa',
    content: `<p>Experience the aromatic and bold flavors of Thailand in Maginhawa Street. From creamy curries to stir-fried pad thai and authentic Thai street food specialties, discover delicious Thai cuisine.</p>`,
    keywords: [
      'thai restaurants maginhawa',
      'thai food maginhawa',
      'curry maginhawa',
      'pad thai maginhawa',
      'thai cuisine maginhawa',
    ],
    filters: {
      keywords: ['thai', 'curry', 'pad-thai', 'tom-yum', 'thai-food', 'spicy'],
    },
    priority: 0.81,
    type: 'cuisine',
  },
  {
    slug: 'desserts-ice-cream-in-maginhawa',
    icon: 'ice-cream',
    title: 'Best Desserts & Ice Cream in Maginhawa - Sweet Treats',
    description:
      'Satisfy your sweet tooth with the best desserts and ice cream in Maginhawa Street. From artisan gelato to cakes, pastries, and frozen treats, find delicious sweets.',
    heading: 'Best Desserts & Ice Cream in Maginhawa',
    content: `<p>Indulge your sweet cravings in Maginhawa Street! Discover artisan ice cream, authentic gelato, decadent cakes, fresh pastries, and specialty desserts perfect for satisfying your sweet tooth.</p>`,
    keywords: [
      'desserts maginhawa',
      'ice cream maginhawa',
      'gelato maginhawa',
      'cakes maginhawa',
      'sweets maginhawa',
    ],
    filters: {
      keywords: ['dessert', 'desserts', 'ice-cream', 'gelato', 'cakes', 'pastries', 'sweet', 'sweet-treats'],
    },
    priority: 0.83,
    type: 'cuisine',
  },
  {
    slug: 'romantic-date-spots-in-maginhawa',
    icon: 'heart',
    title: 'Best Romantic Date Spots in Maginhawa - Couples Dining',
    description:
      'Planning a romantic date? Discover the best date spots in Maginhawa Street. From intimate restaurants to cozy cafes, find the perfect ambiance for couples.',
    heading: 'Best Romantic Date Spots in Maginhawa',
    content: `<p>Create memorable moments with your special someone in Maginhawa Street. Discover intimate restaurants, romantic cafes, and cozy spots perfect for date nights and special occasions.</p>`,
    keywords: [
      'date spots maginhawa',
      'romantic restaurants maginhawa',
      'couples dining maginhawa',
      'intimate restaurants maginhawa',
      'date night maginhawa',
    ],
    filters: {
      keywords: ['date-spot', 'date spot', 'romantic', 'intimate', 'cozy', 'couples'],
    },
    priority: 0.84,
    type: 'experience',
  },
  {
    slug: 'family-friendly-restaurants-in-maginhawa',
    icon: 'users',
    title: 'Best Family-Friendly Restaurants in Maginhawa - Kid-Friendly Dining',
    description:
      'Find the best family-friendly restaurants in Maginhawa Street. Perfect for dining with kids, these spots offer welcoming atmospheres, spacious seating, and family-friendly menus.',
    heading: 'Best Family-Friendly Restaurants in Maginhawa',
    content: `<p>Enjoy quality family time in Maginhawa Street's family-friendly restaurants. From spacious seating to kid-friendly menus and welcoming atmospheres, these spots are perfect for family meals and celebrations.</p>`,
    keywords: [
      'family friendly restaurants maginhawa',
      'kid friendly maginhawa',
      'family dining maginhawa',
      'restaurants for families maginhawa',
      'family meals maginhawa',
    ],
    filters: {
      keywords: ['family-friendly', 'family-dining', 'family friendly', 'group-friendly', 'kids', 'children'],
    },
    priority: 0.85,
    type: 'experience',
  },
  {
    slug: 'instagram-worthy-spots-in-maginhawa',
    icon: 'camera',
    title: 'Instagram-Worthy Spots in Maginhawa - Aesthetic Cafes & Restaurants',
    description:
      'Discover the most Instagram-worthy restaurants and cafes in Maginhawa Street. From aesthetic interiors to photo-worthy dishes, find picture-perfect spots for your feed.',
    heading: 'Instagram-Worthy Spots in Maginhawa',
    content: `<p>Capture stunning photos at Maginhawa Street's most aesthetic spots. From beautifully designed interiors to artfully plated dishes and Instagram-worthy backdrops, these places are perfect for your social media feed.</p>`,
    keywords: [
      'instagram worthy maginhawa',
      'aesthetic cafes maginhawa',
      'instagrammable maginhawa',
      'photo spots maginhawa',
      'pretty restaurants maginhawa',
    ],
    filters: {
      keywords: ['instagram-worthy', 'instagrammable', 'aesthetic', 'photo-spots', 'aesthetic-interiors', 'trendy'],
    },
    priority: 0.83,
    type: 'experience',
  },
  {
    slug: 'vegetarian-vegan-in-maginhawa',
    icon: 'leaf',
    title: 'Best Vegetarian & Vegan Restaurants in Maginhawa - Plant-Based Dining',
    description:
      'Find the best vegetarian and vegan restaurants in Maginhawa Street. From plant-based meals to healthy options, discover restaurants offering delicious meat-free dining.',
    heading: 'Best Vegetarian & Vegan Restaurants in Maginhawa',
    content: `<p>Plant-based eaters, welcome! Maginhawa Street offers excellent vegetarian and vegan options. From fully vegan restaurants to veggie-friendly menus, enjoy delicious and healthy plant-based meals.</p>`,
    keywords: [
      'vegetarian restaurants maginhawa',
      'vegan restaurants maginhawa',
      'plant based maginhawa',
      'healthy food maginhawa',
      'veggie options maginhawa',
    ],
    filters: {
      keywords: ['vegetarian', 'vegan', 'plant-based', 'vegetarian-options', 'healthy', 'organic'],
    },
    priority: 0.82,
    type: 'experience',
  },
  {
    slug: 'outdoor-seating-in-maginhawa',
    icon: 'tree',
    title: 'Restaurants with Outdoor Seating in Maginhawa - Al Fresco Dining',
    description:
      'Enjoy outdoor dining in Maginhawa Street. Discover restaurants and cafes with outdoor seating, garden settings, and al fresco dining perfect for nice weather.',
    heading: 'Restaurants with Outdoor Seating in Maginhawa',
    content: `<p>Dine under the sky in Maginhawa Street! Discover restaurants offering outdoor seating, garden patios, and al fresco dining areas perfect for enjoying meals in the fresh air.</p>`,
    keywords: [
      'outdoor seating maginhawa',
      'al fresco dining maginhawa',
      'garden restaurants maginhawa',
      'outdoor dining maginhawa',
      'patio dining maginhawa',
    ],
    filters: {
      keywords: ['outdoor-seating', 'outdoor-dining', 'garden-setting', 'al-fresco', 'patio'],
    },
    priority: 0.81,
    type: 'amenity',
  },
  {
    slug: 'group-dining-in-maginhawa',
    icon: 'party-popper',
    title: 'Best Group Dining in Maginhawa - Party Venues & Large Groups',
    description:
      'Planning a group meal or party? Find the best group-friendly restaurants in Maginhawa Street. Perfect for celebrations, gatherings, and large groups with party packages available.',
    heading: 'Best Group Dining in Maginhawa',
    content: `<p>Celebrating with friends or family? Maginhawa Street has excellent options for group dining. From spacious restaurants to party packages and group-friendly menus, find the perfect spot for your gathering.</p>`,
    keywords: [
      'group dining maginhawa',
      'party venues maginhawa',
      'large groups maginhawa',
      'celebrations maginhawa',
      'group friendly maginhawa',
    ],
    filters: {
      keywords: ['group-friendly', 'group friendly', 'group-dining', 'party', 'party-packages', 'celebrations'],
    },
    priority: 0.82,
    type: 'experience',
  },
  {
    slug: 'fried-chicken-in-maginhawa',
    icon: 'drumstick',
    title: 'Best Fried Chicken in Maginhawa - Korean & American Style',
    description:
      'Craving fried chicken? Find the best fried chicken spots in Maginhawa Street. From Korean fried chicken to American-style wings, enjoy crispy and flavorful chicken.',
    heading: 'Best Fried Chicken in Maginhawa',
    content: `<p>Fried chicken lovers, this is for you! Maginhawa Street serves up some of the crispiest, most flavorful fried chicken. From Korean-style glazed chicken to classic American wings, satisfy your cravings here.</p>`,
    keywords: [
      'fried chicken maginhawa',
      'korean fried chicken maginhawa',
      'chicken wings maginhawa',
      'crispy chicken maginhawa',
      'kfc style maginhawa',
    ],
    filters: {
      keywords: ['fried-chicken', 'korean-fried-chicken', 'chicken', 'wings', 'chicken-wings', 'crispy'],
    },
    priority: 0.82,
    type: 'cuisine',
  },
];

/**
 * Get all available categories
 */
export function getAllCategories(): Category[] {
  return CATEGORIES;
}

/**
 * Get a category by its slug
 * @param slug - Category slug (e.g., "bars-in-maginhawa")
 * @returns Category object or undefined if not found
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

/**
 * Get all category slugs for static generation
 */
export function getAllCategorySlugs(): string[] {
  return CATEGORIES.map((category) => category.slug);
}

/**
 * Check if a slug is a valid category
 */
export function isValidCategory(slug: string): boolean {
  return CATEGORIES.some((category) => category.slug === slug);
}
