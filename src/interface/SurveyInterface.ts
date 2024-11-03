export interface SurveyType {
  id: string;
  type_name: string;
  description: string;
  created_at: string;
}

export interface Question {
  created_at: string;
  id: string;
  options: string[];
  question_text: string;
  question_type: string;
  survey_type_id: string;
  survey_type_name: string | null;
}

export interface UserResponse {
  user_id: string;
  question_id: string;
  response: string[];
}
