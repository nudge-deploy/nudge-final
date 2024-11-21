import supabase from "../database/supabaseClient"
import { Link, useNavigate } from "react-router-dom";
import { useGetUser } from "../hooks/useGetUser";
import { useEffect, useState } from "react";

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
      navigate('/auth/ui/signUp')
    }
  }

  const [startSimulation, setStartSimulation] = useState(false);
  const handleUserStartSimulation = async () => {
    console.log('handle user start simul SURVEYHOME');
    if(userId) {
      setStartSimulation(true);
      const { data, error } = await supabase
        .from('user_finish_simulations')
        .insert({
          user_id: userId,
          finished_simulation: false,
        });
      console.log('USER ID EXISTS.');
      if(error) {
        console.log('error while starting simulation SURVEYHOME', error)
      } else if(data) {
        console.log('SURVEYHOME user start simulation!! finished_simulation FALSE');
      }
    } else {
      console.log('user id doesnt exist');
    }
  }

  async function checkUserFinishSurvey() {
    if(userId) {
      const { data, error } = await supabase
        .from('user_finish_surveys')
        .select('*')
        .eq('user_id', userId)
      
      if(error) {
        console.log('error while checking user finish survey SURVEYHOME: ', error);
      }
      if(data) {
        console.log('successful checking user finish survey SURVEYHOME: ', data);
        if(data.length > 0) {
          console.log('panggil start simul');
          handleUserStartSimulation();
        } else {
          console.log('user hasnt finished the survey', userId);
        }
      }
    }
  }

  useEffect(() => {
    if(userId) {
      checkUserFinishSurvey();
      checkUserConsent();
    }
  }, [userId]);

  const checkUserConsent = async () => {
    const { data, error } = await supabase
      .from('user_consent_form')
      .select('consent_agreement')
      .eq('user_id', userId);
    
    if(error) {
      console.log('error checking consent agreement');
    }

    if(data && data.length > 0) {
      console.log('successful checking user consent', data);
      navigate('/surveyHome');
    } else {
      console.log('user consent doenst exist');
      navigate('/');
    }
  }

  useEffect(() => {
    if(startSimulation) {
      console.log('start simulation!!');
      navigate('/simulation');
    } else {
      console.log('simulation not started!!');
    }
  }, [startSimulation, navigate])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [])
  

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
      <div className="text-slate-700 text-center text-xl font-bold">
        Selamat datang, {user?.email}
      </div>
      <div className="text-center text-base text-slate-700">
        Silakan mulai apabila Anda merasa sudah siap. Jawaban Anda akan tersimpan secara otomatis.
      </div>
      <Link 
        className="btn btn-primary text-base text-slate-100" 
        to="/surveyForms">
        Ayo mulai
      </Link>
      <button className="btn btn-link text-slate-700" onClick={userSignOut}>Keluar</button>
    </div>

  )
}
