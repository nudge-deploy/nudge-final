export interface Records {
  id: string;
  page_id: string;
  category_id: number;
  record_name: string;
  record_title: string;
  record_code: string;
  record_description: string;
}

export interface Pages {
  id: string;
  page_name: string;
}

export interface UserPageVisits {
  user_id: string;
  user_email: string;
  page_id: string;
  page_name: string;
  record_id?: string;
  record_title?: string;
  enter_time: number;
  exit_time: number;
  time_spent: number;
  simulation_id: string;
}

export interface UserPurchase {
  id?: number;
  user_id: string;
  name_purchased: string;
  percentage_purchased: number;
}

export interface UserRecommendation {
  user_id: string;
  recommended_product: string;
}