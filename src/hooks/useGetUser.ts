import { User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import supabase from '../database/supabaseClient';
import { useNavigate } from 'react-router-dom';

export const useGetUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session?.user) {
          setUser(session.user);
          
          setUserId(session.user.id);
        } else {
          setUser(null);
        }
      } catch (err) {
        setError((err as Error).message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Listen to changes in the authentication state
    // const { data: subscription } = supabase.auth.onAuthStateChange(
    //   (_event, session) => {
    //     setUser(session?.user || null);
    //   }
    // );

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session)
    
      if (event === 'INITIAL_SESSION') {
        console.log('initial session: ', data);
      } else if (event === 'SIGNED_IN') {
        // handle sign in event
        console.log('sign in event: ', data);
        // navigate('/surveyHome');
      } else if (event === 'SIGNED_OUT') {
        console.log('sign out event: ', data);
        navigate('/')
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('password recov: ', data);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('token refreshed: ', data);
      } else if (event === 'USER_UPDATED') {
        console.log('user updated: ', data);
      }
    })

    return () => {
      data.subscription.unsubscribe()
    };
  }, []);

  return { user, userId, loading, error };
};
