import { useForm } from "react-hook-form"
import supabase from "../../database/supabaseClient";
import { AuthProps } from "../../interface/AuthInterface";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";


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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [])
  

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
        <div className="text-xl text-center text-slate-700">Mari membuat akun terlebih dahulu</div>
        <div className="text-xs text-center text-slate-700">Email dan password tidak wajib valid. Namun, email yang valid akan lebih baik.</div>
        <input {...register("email", { required: "This is required"})} className="input input-primary bg-slate-100 input-bordered text-xs text-slate-700" type="email" placeholder="Email" />
        <input {...register("password", { required: "This is required"})} className="input input-primary bg-slate-100 input-bordered text-xs text-slate-700" type="password" placeholder="Password" />
        <input className="btn btn-primary text-slate-100" type="submit"  value='Buat akun'/>   
        <div className="text-xs text-center text-slate-700">Sudah punya akun? <Link to='/auth/ui/signIn' className="text-slate-700 text-xs underline">Masuk</Link></div>
      </form>
    </div>
  )
}
