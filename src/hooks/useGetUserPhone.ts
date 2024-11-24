import { useEffect, useState } from "react";
import { useGetUser } from "./useGetUser"
import supabase from "../database/supabaseClient";

export const useGetUserPhone = () => {

  const { userId } = useGetUser();
  const [phoneNumber, setPhoneNumber] = useState('');
  
  useEffect(() => {
    
    const getUserPhone = async () => {
      if(userId) {

        const { data, error } = await supabase
          .from('user_finish_simulations')
          .select('phone_number')
          .eq('user_id', userId)
          .neq('phone_number', '');
        
        if(error) {
          console.log('error while getting user phone: ', error);
        } else if(data) {
          console.log('data usegetuserphone: ', data);
          setPhoneNumber(data[0].phone_number);
        }
        
      }
    }
    getUserPhone();
  }, [userId])
  
  return { phoneNumber }
}