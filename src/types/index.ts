export type UserRole = 'Admin' | 'Artist' | 'User';

export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Blocked';

export interface AdminUser {
  id: string;
  fullName?: string;
  name?: string;
  email: string;
  role: string;
  avatarUrl: string;
  token?: string;
}

export interface ArtistApplication {
  id: string;
  name: string;
  username?: string;
  title: string;
  email: string;
  socials: string;
  appliedDate: string;
  status: ApplicationStatus;
  avatarUrl: string;
  artistStatement: string;
  externalPortfolios: string[];
}

export type ProductCategory = 'CLOTHING' | 'MUSIC' | 'AUCTION' | 'MERCH';

export interface ProductApproval {
  id: string;
  title: string;
  artist: string;
  category: ProductCategory;
  price: number;
  imageUrl: string;
  thumbnails: string[];
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  marketplaceTarget: string;
  dropLimit: number;
  materialDescription: string;
  sizes: string[];
  colors: string[];
  sizeStock?: Record<string, number>;
}

export interface UserDirectoryItem {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: UserRole;
  joinedDate: string;
  status: 'Active' | 'Blocked' | 'Pending';
  avatarUrl: string;
  artistStatement?: string;
  socials?: string;
  posts?: {
    id: string;
    artistName: string;
    type: 'Image' | 'Audio';
    caption: string;
    imageUrl?: string;
    audioUrl?: string;
    likes: number;
    shares: number;
  }[];
}
