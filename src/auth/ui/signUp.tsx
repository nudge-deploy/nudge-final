import { useForm } from "react-hook-form"
import supabase from "../../database/supabaseClient";
import { AuthProps } from "../../interface/AuthInterface";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";


export default function SignUp() {

  const { register, handleSubmit } = useForm<AuthProps>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSignUp(data: AuthProps) {
    setLoading(true);
    if(data.password.length < 6) {
      alert("Password length must be minimum 6 letters");
    }
    if(data.email.length == 0 || data.password.length == 0) {
      alert('Please fill the required fields')
    }
    let { error } = await
      supabase.auth.signUp({
        email: data.email,
        password: data.password
      });

      if(error) {
        alert('Error while signing up. Account may have been registered or Check your internet connection.');
        setLoading(false);
        return;
      } else {
        setLoading(false);
        console.log('Success signing up');
        navigate('/auth/ui/signIn')
      }
  }

  if(loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-slate-100">
        <span className="loading loading-spinner"></span>
      </div>
    )
  }

  return (
    <div className="h-screen flex justify-center items-start max-tablet:items-center max-mobile:items-center bg-slate-100">
      <form onSubmit={handleSubmit(handleSignUp)} className="flex flex-col space-y-2 max-w-md p-4 max-tablet:w-4/5 max-mobile:w-11/12">
        <div className="text-xl text-slate-700">Create account to enter the study</div>
        <div className="text-xs text-slate-700">Don't worry. It will be quick :)</div>
        <input {...register("email", { required: "This is required"})} className="input input-primary bg-slate-100 input-bordered text-xs text-slate-700" type="email" placeholder="Email" />
        <input {...register("password", { required: "This is required"})} className="input input-primary bg-slate-100 input-bordered text-xs text-slate-700" type="password" placeholder="Password" />
        <input className="btn btn-primary text-slate-100" type="submit"/>   
        <div className="text-xs text-center text-slate-700">Already have an account? <Link to='/auth/ui/signIn' className="text-slate-700 text-xs underline">Sign In</Link></div>
      </form>
    </div>
  )
}
