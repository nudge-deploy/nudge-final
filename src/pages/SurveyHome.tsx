import supabase from "../database/supabaseClient"
import { Link, useNavigate } from "react-router-dom";
import { useGetUser } from "../hooks/useGetUser";
import { useEffect } from "react";

export default function SurveyHome() {
  
  // const { user } = useSession();
  const { user, userId, loading } = useGetUser();
  const navigate = useNavigate();

  async function userSignOut() {
    const { error } = await supabase.auth.signOut();
    if(error) {
      throw new Error('Error while signing out');
    } else {
      console.log('user signed out');
      navigate('/')
    }
  }

    async function checkUserFinishSurvey() {
      if(userId) {
        const { data, error } = await supabase
          .from('user_finish_surveys')
          .select('*')
          .eq('user_id', userId)
        
        if(error) {
          console.log('error while checking user finish survey: ', error);
        }
        if(data) {
          console.log('successful checking user finish survey: ', data);
          if(data.length > 0) {
            navigate('/simulation')
          } else {
            console.log('user hasnt finished the survey', userId);
          }
        }
      }
    }

  useEffect(() => {
    if(userId) {
      checkUserFinishSurvey();
    }
  }, [userId])
  

  if(!user) {
    navigate('/');
  }
  if(loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-slate-100">
        <span className="loading loading-spinner"></span>
      </div>
    )
  }
  return (
    <div className="p-3 bg-slate-100 h-screen flex flex-col space-y-3 justify-center items-center max-mobile:justify-center max-tablet:justify-center">
      <div className="text-slate-700 text-center text-xl font-medium">
        Welcome, {user?.email}
      </div>
      <div className="text-center text-base text-slate-700">
        Start if you are ready to take the study
      </div>
      <Link 
        className="btn btn-primary text-base text-slate-100" 
        to="/surveyForms">
        Let's start
      </Link>
      <button className="btn btn-link text-slate-700" onClick={userSignOut}>Sign out</button>
    </div>

  )
}
