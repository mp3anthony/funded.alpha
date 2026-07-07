export interface HouseholdContribution {
  id: string;
  household_id: string;
  member_id: string;
  amount: number;
  frequency: 'weekly' | 'fortnightly' | 'monthly';
  created_at: string;
  updated_at: string;
}

export interface ContributionRule {
  id: string;
  household_id: string;
  member_id: string;
  threshold_amount: number;
  action_type: 'goal' | 'contribution';
  action_target_id: string; // goal ID or member's contribution ID
  amount_to_add: number;
  amount_type: 'fixed' | 'percentage';
  is_active: boolean;
  created_at: string;
}

export interface Member {
  id: string | number;
  name: string;
  email: string;
  role: 'owner' | 'member';
  avatar: string;
  avatar_url?: string | null;
  invitation_status?: 'pending' | 'accepted' | 'declined';
  user_id?: string | null;
}
