export type ScreenTab = 'feed' | 'grupos' | 'market' | 'mensajes' | 'perfil' | 'login';

export interface Story {
  id: string;
  title: string;
  userName: string;
  avatarUrl: string;
  storyImage: string;
  isAdd?: boolean;
  timeAgo: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  colorClass: string;
}

export interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorTag: string;
  authorTagColor: string;
  timeAgo: string;
  verified?: boolean;
  content: string;
  pdfAttachment?: {
    name: string;
    size: string;
    downloads: number;
    fileContent?: string;
  };
  poll?: {
    totalVotes: number;
    timeLeft: string;
    options: PollOption[];
    userVotedOption?: string;
  };
  event?: {
    title: string;
    category: string;
    image: string;
    date: string;
    location: string;
    attendeesCount: number;
    attendeeAvatars: string[];
    isAttending?: boolean;
  };
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface MarketItem {
  id: string;
  title: string;
  price: number;
  image: string;
  faculty: string;
  location: string;
  rating: number;
  seller: string;
  sellerAvatar?: string;
  condition: string;
  conditionColor: string;
  category: string;
  isFav?: boolean;
  isDonation?: boolean;
  isNewToday?: boolean;
  description?: string;
}

export interface LiveRoom {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  secondaryTag?: string;
  desc: string;
  onlineCount: number;
  avatars: string[];
  type: 'pomodoro' | 'screen';
  statusText: string;
  isConnected?: boolean;
}

export interface CommunityGroup {
  id: string;
  title: string;
  categoryTag: string;
  categoryColor: string;
  badgeTag: string;
  description: string;
  membersCount: number;
  activityNote: string;
  activityIcon: string;
  activityColor?: string;
  image: string;
  isJoined?: boolean;
  type: 'materias' | 'clubes' | 'carrera';
}

export interface ChatThread {
  id: string;
  name: string;
  avatar: string;
  badge?: string;
  badgeType?: 'market' | 'oficial' | 'student';
  category: 'grupos' | 'directos' | 'market';
  lastMessage: string;
  time: string;
  unreadCount?: number;
  productInfo?: {
    name: string;
    icon: string;
    price?: number;
  };
  groupInfo?: {
    code: string;
    members: number;
  };
  isOnline?: boolean;
  messages: {
    id: string;
    sender: 'them' | 'me';
    text: string;
    time: string;
  }[];
}

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at?: string;
  sender_profile?: {
    user_id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    career?: string;
    university?: string;
  };
  receiver_profile?: {
    user_id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    career?: string;
    university?: string;
  };
}

export interface UserSearchResult {
  id: string;
  user_id?: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  university?: string;
  career?: string;
  faculty?: string;
  friendship_status: FriendshipStatus;
  request_id?: string;
}

export interface CampusNotification {
  id: string;
  user_id: string;
  actor_id?: string;
  type: string;
  title: string;
  body: string;
  entity_type?: string;
  entity_id?: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
  actor_name?: string;
  actor_avatar?: string;
  actor_username?: string;
}
