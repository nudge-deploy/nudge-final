import { useNavigate } from "react-router-dom";
import { useGetUser } from "../hooks/useGetUser"
import { useEffect, useState } from "react";
import supabase from "../database/supabaseClient";
import { UserResponse } from "../interface/SurveyInterface";

export default function AdminPage() {
  const { user } = useGetUser();
  const navigate = useNavigate();
  const [validate, setValidate] = useState(true);

  const [allUsers, setAllUsers] = useState();

  const [allUserResponses, setAllUserResponses] = useState<UserResponse[]>([]);

  const validateAdmin = () => {
    if(user && user.email) {
      if(user.email.includes('admin') == false) {
        setValidate(false);
        alert('You are not authorized to access this page');
        navigate('/surveyHome')
      }
    }
  }

  async function fetchAllUserResponses() {
    if(validate) {
      const { data, error } = await supabase
        .from('user_responses')
        .select('*')
      
      if(error) {
        console.log('Error while fetching user responses');
      }
      if(data) {
        console.log(data);
        setAllUserResponses(data);
      }
    } else {
      console.log('user not authorized');
    }
  }

  // FETCH ALL USERS
  async function fetchAllUsers() {
    const { data, error } = await supabase
      .from('auth.users')
      .select('*');
    
    if(error) {
      console.log('error while fetching all users');
    }
    if(data) {
      console.log('RESPONSE ALL USERS: ', data);
    }
  }

  useEffect(() => {
    validateAdmin();
  }, [user])

  useEffect(() => {
    fetchAllUserResponses();
    fetchAllUsers();
  }, [validate])
  
  console.log('all user responses: ', allUserResponses);
  
  if(validate == false) {
    return <div></div>
  }
  return (
    <div className="p-3 flex flex-col space-y-3 max-mobile:justify-center max-tablet:justify-center bg-slate-100 text-slate-800">
      <div className="text-xl font-medium">
        Welcome, {user?.email}
      </div>
        {
          allUserResponses.map((userResponse) => (
            <div>{userResponse.user_id} {userResponse.question_id} {userResponse.response}</div>
          ))
        }
      <div className="">
        List of User Page Time Spent
      </div>
    </div>
  )
}
