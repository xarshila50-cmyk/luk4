import { createContext, useContext, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';

export type Language = 'ge' | 'en';

const languages: Language[] = ['ge', 'en'];
const defaultLanguage: Language = 'ge';

const translations: Record<string, string> = {
  'Free giving in Georgia': 'რასაცა გასცემ შენია, რაც არა დაკარგულია',
  Home: 'მთავარი',
  Create: 'დამატება...',
  Profile: 'პროფილი',
  Admin: 'ადმინი',
  Login: 'შესვლა',
  Register: 'რეგისტრაცია',
  'Log out': 'გასვლა',
  'Logging out...': 'გასვლა...',
  'New reservation activity': 'ახალი აქტივობა ჯავშანზე',
  'Primary navigation': 'მთავარი ნავიგაცია',
  'Mobile navigation': 'მობილური ნავიგაცია',
  'Skip to content': 'კონტენტზე გადასვლა',
  Language: 'ენა',

  'Free items in Georgia': 'ნივთების გაცემა-გაჩუქება',
  'Find unwanted items people are giving away and help keep useful things out of waste.':
    'არ გადააგდო, გააჩუქე! მიეცი ნივთებს მეორე სიცოცხლე და გაეცი ის, რაც აღარ გჭირდება, იპოვე ახალი მფლობელი ოდესღაც შენი საყვარელი ნივთისთვის.',
  'Loading free items': 'უფასო ნივთები იტვირთება',
  'Gaachuqe is loading the latest posts.':
    'Gaachuqe ახალ განცხადებებს ტვირთავს.',
  'Could not load feed': 'განცხადებები ვერ ჩაიტვირთა',
  'Please try again.': 'გთხოვთ სცადოთ თავიდან.',
  'No free items found': 'ნივთები ვერ მოიძებნა',
  'Try changing your search or filters to see more available items.':
    'სცადეთ ძიების ან ფილტრების შეცვლა მეტი ნივთის სანახავად.',
  'Loading more items': 'მეტი ნივთი იტვირთება',
  'More free items are being loaded.': 'იტვირთება მეტი უფასო ნივთი.',
  'Loading...': 'იტვირთება...',
  'Load more': 'მეტის ჩატვირთვა',
  'Free item feed': 'უფასო ნივთების სია',

  Filters: 'ფილტრები',
  Open: 'გახსნა',
  Close: 'დახურვა',
  'Search, category, city, and status': 'ძიება, კატეგორიები, ადგილმდებარეობა და ნივთის სტატუსი',
  active: 'აქტიური',
  'Search free items': 'უფასო ნივთების ძიება',
  Category: 'კატეგორია',
  City: 'ქალაქი',
  Status: 'სტატუსი',
  'Search by city': 'ქალაქით ძიება',
  'Search city': 'ქალაქის ძიება',
  'All categories': 'ყველა კატეგორია',
  Clothing: 'ტანსაცმელი',
  Electronics: 'ელექტრონიკა',
  Books: 'წიგნები',
  Children: 'ბავშვები',
  Sports: 'სპორტი',
  Other: 'სხვა',
  HomeCategory: 'სახლი',
  'Any status': 'ნებისმიერი სტატუსი',
  Available: 'ხელმისაწვდომია',
  Reserved: 'დაჯავშნილია',
  Given: 'გაჩუქებულია',
  Archived: 'არქივშია',
  OpenStatus: 'ღია',
  Pending: 'მოლოდინში',
  Accepted: 'დადასტურებულია',
  Completed: 'დასრულებულია',
  Cancelled: 'გაუქმებულია',

  'Create Post': 'განცხადების დამატება',
  'Give away an unwanted item for free.': 'აჩუქე არასაჭირო ნივთი უფასოდ.',
  Title: 'სათაური',
  Description: 'აღწერა',
  Photos: 'ფოტოები',
  'Add photos': 'ფოტოების დამატება',
  'Create post': 'განცხადების დამატება',
  'Creating post...': 'განცხადება იქმნება...',
  'Post could not be created.': 'განცხადება ვერ შეიქმნა.',
  'Photos could not be processed.': 'ფოტოები ვერ დამუშავდა.',
  'You must be logged in to create a post.':
    'განცხადების დასამატებლად უნდა შეხვიდეთ სისტემაში.',
  'Add 1 to 5 photos. Images are compressed before upload.':
    'დაამატეთ 1-დან 5-მდე ფოტო. ატვირთვამდე ფოტოები იკუმშება.',
  'Remove photo': 'ფოტოს წაშლა',
  'Choose photos': 'ფოტოების არჩევა',
  'slots left': 'ადგილი დარჩა',

  'Loading item': 'ნივთი იტვირთება',
  'Gaachuqe is loading item details.': 'Gaachuqe ნივთის დეტალებს ტვირთავს.',
  'Item not found': 'ნივთი ვერ მოიძებნა',
  'This item could not be loaded.': 'ნივთი ვერ ჩაიტვირთა.',
  Back: 'უკან',
  Date: 'თარიღი',
  Expires: 'იწურება',
  'Gaachuqe member': 'Gaachuqe-ის წევრი',
  'Owner information is limited': 'მფლობელის ინფორმაცია შეზღუდულია',
  'Reservation active': 'ჯავშანი აქტიურია',
  'Contact the owner to arrange pickup.':
    'დაუკავშირდით მფლობელს ნივთის ასაღებად.',
  Call: 'დარეკვა',
  Edit: 'რედაქტირება',
  Save: 'შენახვა',
  'Saving...': 'ინახება...',
  Cancel: 'გაუქმება',
  Delete: 'წაშლა',
  'Deleting...': 'იშლება...',
  'Mark given': 'გაჩუქებულად მონიშვნა',
  Report: 'რეპორტი',
  Reserve: 'დაჯავშნა',
  'Reserving...': 'ჯავშანი იქმნება...',
  Unreserve: 'ჯავშნის გაუქმება',
  'Cancelling...': 'უქმდება...',
  'Log in to reserve': 'დაჯავშნისთვის შედით',
  'Report item': 'ნივთის დარეპორტება',
  'Reports are reviewed by admins and help keep the marketplace safe.':
    'რეპორტებს ადმინები განიხილავენ და ისინი პლატფორმის უსაფრთხოებას ეხმარება.',
  Subject: 'თემა',
  Details: 'დეტალები',
  'Submit report': 'რეპორტის გაგზავნა',
  'Submitting...': 'იგზავნება...',
  'Could not reserve item.': 'ნივთის დაჯავშნა ვერ მოხერხდა.',
  'Could not cancel reservation.': 'ჯავშნის გაუქმება ვერ მოხერხდა.',
  'Could not mark item as given.': 'ნივთის გაჩუქებულად მონიშვნა ვერ მოხერხდა.',
  'Could not delete item.': 'ნივთის წაშლა ვერ მოხერხდა.',
  'Could not update item.': 'ნივთის განახლება ვერ მოხერხდა.',
  'Could not submit report.': 'რეპორტის გაგზავნა ვერ მოხერხდა.',
  'Log in to reserve this item.': 'ამ ნივთის დასაჯავშნად შედით სისტემაში.',
  'Reservation was not found.': 'ჯავშანი ვერ მოიძებნა.',
  'Post was not found.': 'განცხადება ვერ მოიძებნა.',
  'Log in to report this item.': 'ამ ნივთის დასარეპორტებლად შედით სისტემაში.',
  'Mark this item as given? Active reservations will be completed.':
    'მოვნიშნოთ ეს ნივთი გაჩუქებულად? აქტიური ჯავშნები დასრულდება.',
  'Delete this post permanently? This cannot be undone.':
    'წავშალოთ ეს განცხადება სამუდამოდ? ეს ქმედება შეუქცევადია.',
  'Cancel your reservation for this item?': 'გავაუქმოთ ამ ნივთის ჯავშანი?',
  'Reserve this item? The owner will be notified.':
    'დაჯავშნოთ ეს ნივთი? მფლობელი მიიღებს შეტყობინებას.',

  'Use your email and password to access Gaachuqe.':
    'Gaachuqe-ში შესასვლელად გამოიყენეთ ელფოსტა და პაროლი.',
  Email: 'ელფოსტა',
  Password: 'პაროლი',
  'No account?': 'არ გაქვთ ანგარიში?',
  'Login failed.': 'შესვლა ვერ მოხერხდა.',
  'Create an account with your name, email, phone number, and password.':
    'შექმენით ანგარიში',
  'Display name': 'სახელი',
  'Phone number': 'ტელეფონის ნომერი',
  'Create account': 'ანგარიშის შექმნა',
  'Creating account...': 'ანგარიში იქმნება...',
  'Log in': 'შესვლა',
  'Logging in...': 'შესვლა...',
  'First name': 'სახელი',
  'Last name': 'გვარი',
  'Already registered?': 'უკვე დარეგისტრირებული ხართ?',
  'Registration failed.': 'რეგისტრაცია ვერ მოხერხდა.',

  'Loading profile': 'პროფილი იტვირთება',
  'Gaachuqe is loading your account.': 'Gaachuqe თქვენს ანგარიშს ტვირთავს.',
  'Could not load profile': 'პროფილი ვერ ჩაიტვირთა',
  'Phone unavailable': 'ტელეფონი მიუწვდომელია',
  'Profile statistics': 'პროფილის სტატისტიკა',
  'Total posts': 'სულ განცხადებები',
  'Reserved posts': 'დაჯავშნილი განცხადებები',
  'My reservations': 'ჩემი ჯავშნები',
  'My Posts': 'ჩემი განცხადებები',
  'Reserved Items': 'დაჯავშნილი ნივთები',
  Settings: 'პარამეტრები',
  'No posts yet': 'განცხადებები ჯერ არ არის',
  'Create a post when you have an item to give away.':
    'დაამატეთ განცხადება, როცა გასაჩუქებელი ნივთი გაქვთ.',
  Statistics: 'სტატისტიკა',
  View: 'ნახვა',
  'No reserved items': 'დაჯავშნილი ნივთები არ არის',
  'Reserved items will appear here.': 'დაჯავშნილი ნივთები აქ გამოჩნდება.',
  'Account settings': 'ანგარიშის პარამეტრები',
  'Save settings': 'პარამეტრების შენახვა',
  'Settings saved.': 'პარამეტრები შენახულია.',
  'Delete account': 'ანგარიშის წაშლა',
  'Permanently remove your profile, posts, reservations, and post images.':
    'სამუდამოდ წაშლის თქვენს პროფილს, განცხადებებს, ჯავშნებს და ფოტოებს.',
  'Your account': 'თქვენი ანგარიში',
  Location: 'მდებარეობა',
  reservations: 'ჯავშანი',
  'Could not delete post.': 'განცხადების წაშლა ვერ მოხერხდა.',
  'Could not mark post as given.':
    'განცხადების გაჩუქებულად მონიშვნა ვერ მოხერხდა.',
  'Unavailable item': 'მიუწვდომელი ნივთი',
  'Location unavailable': 'მდებარეობა მიუწვდომელია',
  'Settings could not be saved.': 'პარამეტრები ვერ შეინახა.',
  'Delete account permanently': 'ანგარიშის სამუდამოდ წაშლა',
  'This removes your profile, posts, post images, and reservations. This action cannot be undone.':
    'ეს წაშლის თქვენს პროფილს, განცხადებებს, ფოტოებს და ჯავშნებს. ქმედება შეუქცევადია.',
  'Type DELETE to confirm': 'დასადასტურებლად აკრიფეთ DELETE',
  'Account could not be deleted.': 'ანგარიში ვერ წაიშალა.',

  'Admin dashboard': 'ადმინის პანელი',
  'Review users, moderate posts, and triage reports.':
    'გადახედეთ მომხმარებლებს, მართეთ განცხადებები და განიხილეთ რეპორტები.',
  'Loading admin data': 'ადმინის მონაცემები იტვირთება',
  'Gaachuqe is loading moderation records.':
    'Gaachuqe მოდერაციის ჩანაწერებს ტვირთავს.',
  'Could not load admin tools': 'ადმინის ხელსაწყოები ვერ ჩაიტვირთა',
  Users: 'მომხმარებლები',
  Posts: 'განცხადებები',
  Reports: 'რეპორტები',
  'Open reports': 'ღია რეპორტები',
  Reservations: 'ჯავშნები',
  'Expired posts': 'ვადაგასული განცხადებები',
  User: 'მომხმარებელი',
  Role: 'როლი',
  Joined: 'შეუერთდა',
  Post: 'განცხადება',
  Owner: 'მფლობელი',
  Action: 'ქმედება',
  Reporter: 'რეპორტის ავტორი',
  Created: 'შექმნილია',
  Confirm: 'დადასტურება',
  'Deleted post': 'წაშლილი განცხადება',
  Reviewing: 'განხილვაში',
  Resolved: 'დასრულებული',
  Dismissed: 'უარყოფილი',
  'Admin statistics': 'ადმინის სტატისტიკა',
  'No users': 'მომხმარებლები არ არის',
  'Registered users will appear here.':
    'რეგისტრირებული მომხმარებლები აქ გამოჩნდება.',
  'No posts': 'განცხადებები არ არის',
  'Posts created by members will appear here.':
    'წევრების შექმნილი განცხადებები აქ გამოჩნდება.',
  'No reports': 'რეპორტები არ არის',
  'Member reports will appear here.': 'წევრების რეპორტები აქ გამოჩნდება.',
  Tbilisi: 'თბილისი',
  Batumi: 'ბათუმი',
  Kutaisi: 'ქუთაისი',
  Rustavi: 'რუსთავი',
  Zugdidi: 'ზუგდიდი',
  Gori: 'გორი',
  Poti: 'ფოთი',
  Kobuleti: 'ქობულეთი',
  Samtredia: 'სამტრედია',
  Khashuri: 'ხაშური',
  Senaki: 'სენაკი',
  Zestaponi: 'ზესტაფონი',
  Marneuli: 'მარნეული',
  Telavi: 'თელავი',
  Akhaltsikhe: 'ახალციხე',
  Ozurgeti: 'ოზურგეთი',
  Kaspi: 'კასპი',
  Chiatura: 'ჭიათურა',
  Tsqaltubo: 'წყალტუბო',
  Sagarejo: 'საგარეჯო',
  Gardabani: 'გარდაბანი',
  Borjomi: 'ბორჯომი',
  Tkibuli: 'ტყიბული',
  Khoni: 'ხონი',
  Bolnisi: 'ბოლნისი',
  Akhalkalaki: 'ახალქალაქი',
  Mtskheta: 'მცხეთა',
  Gurjaani: 'გურჯაანი',
  Dusheti: 'დუშეთი',
  Kareli: 'ქარელი',
  Sachkhere: 'საჩხერე',
  Dedoplistsqaro: 'დედოფლისწყარო',
  Lagodekhi: 'ლაგოდეხი',
  Ninotsminda: 'ნინოწმინდა',
  Abasha: 'აბაშა',
  Tsnori: 'წნორი',
  Terjola: 'თერჯოლა',
  Martvili: 'მარტვილი',
  Jvari: 'ჯვარი',
  Khobi: 'ხობი',
  Vani: 'ვანი',
  Baghdati: 'ბაღდათი',
  Vale: 'ვალე',
  Tsalka: 'წალკა',
  Tetritsqaro: 'თეთრიწყარო',
  Dmanisi: 'დმანისი',
  Oni: 'ონი',
  Ambrolauri: 'ამბროლაური',
  Sighnaghi: 'სიღნაღი',
  Tsageri: 'ცაგერი',
  Lentekhi: 'ლენტეხი',
  Stepantsminda: 'სტეფანწმინდა',
  Mestia: 'მესტია',
  Georgia: 'საქართველო',

  'Page not found': 'გვერდი ვერ მოიძებნა',
  'The page you requested does not exist in Gaachuqe.':
    'მოთხოვნილი გვერდი Gaachuqe-ში არ არსებობს.',
  'Go home': 'მთავარზე დაბრუნება',
};

type I18nContextValue = {
  language: Language;
  t: (text: string) => string;
  localizedPath: (path: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { lang } = useParams();
  const language = isLanguage(lang) ? lang : null;

  if (!language) {
    return <Navigate replace to={`/${defaultLanguage}`} />;
  }

  return (
    <I18nContext.Provider
      value={{
        language,
        t: (text) => (language === 'ge' ? (translations[text] ?? text) : text),
        localizedPath: (path) => localizePath(path, language),
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider.');
  }

  return context;
}

export function useOptionalI18n() {
  return useContext(I18nContext);
}

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && languages.includes(value as Language);
}

export function localizePath(path: string, language: Language) {
  if (/^(https?:|mailto:|tel:)/.test(path)) {
    return path;
  }

  if (path === '/') {
    return `/${language}`;
  }

  return `/${language}${path.startsWith('/') ? path : `/${path}`}`;
}

export function switchLanguagePath(pathname: string, nextLanguage: Language) {
  const parts = pathname.split('/');

  if (isLanguage(parts[1])) {
    parts[1] = nextLanguage;
    return parts.join('/') || `/${nextLanguage}`;
  }

  return `/${nextLanguage}`;
}
