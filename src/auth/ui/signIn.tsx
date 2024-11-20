import { useForm } from "react-hook-form";
import supabase from "../../database/supabaseClient";
import { AuthProps } from "../../interface/AuthInterface";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";


export default function SignIn() {

  const { register, handleSubmit } = useForm<AuthProps>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSignIn(data: AuthProps) {
    setLoading(true);
    let { error } = await
      supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if(error) {
        alert('Some problems occured. Please go back and reload the page.');
        setLoading(false);
      } else {
        setLoading(false);
        console.log('Success signing in');
        navigate('/surveyHome')
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
    <div className="h-screen bg-slate-100 flex justify-center items-start max-tablet:items-center max-mobile:items-center">
      <form onSubmit={handleSubmit(handleSignIn)} className="flex flex-col space-y-2 max-w-md p-4 max-tablet:w-4/5 max-mobile:w-11/12">
        <div className="text-xl text-center text-slate-700">Masuk ke penelitian</div>
        <div className="text-xs text-center text-slate-700">Silakan masukkan email dan password yang sudah dibuat sebelumnya.</div>
        <input {...register("email", { required: "This is required" })} className="bg-slate-100 text-slate-700 input input-primary input-bordered text-xs" type="email" placeholder="Email" />
        <input {...register("password", { required: "This is required" })} className="bg-slate-100 text-slate-700 input input-primary input-bordered text-xs" type="password" placeholder="Password" />
        <input className="btn btn-primary text-slate-100" type="submit" value='Masuk' />
        <div className="text-xs text-center text-slate-700">Belum punya akun? <Link to='/auth/ui/signUp' className="text-slate-700 text-xs underline">Buat akun disini</Link></div>
      </form>
    </div>
  )
}
